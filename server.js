require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');

const { initializeDB } = require('./db');
const { verifyToken } = require('./middleware');

const authRoutes = require('./routes/auth');
const restaurantRoutes = require('./routes/restaurants');
const stripeRoutes = require('./routes/stripe');
const productRoutes = require('./routes/products');
const paymentRoutes = require('./routes/payments');
const menuRoutes = require('./routes/menu');
const QRCode = require('qrcode');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize database
initializeDB();

// Auth Routes
app.post('/api/auth/signup', authRoutes.signup);
app.post('/api/auth/login', authRoutes.login);
app.post('/api/auth/logout', authRoutes.logout);
app.get('/api/auth/user', verifyToken, authRoutes.getCurrentUser);

// Restaurant Routes
app.post('/api/restaurants', verifyToken, restaurantRoutes.createRestaurant);
app.get('/api/restaurants', verifyToken, restaurantRoutes.getRestaurants);
app.get('/api/restaurants/:id', verifyToken, restaurantRoutes.getRestaurant);
app.put('/api/restaurants/:id', verifyToken, restaurantRoutes.updateRestaurant);
app.delete('/api/restaurants/:id', verifyToken, restaurantRoutes.deleteRestaurant);

// Stripe Routes
app.post('/api/restaurants/:id/stripe/create', verifyToken, stripeRoutes.createStripeAccount);
app.get('/api/restaurants/:id/stripe/status', verifyToken, stripeRoutes.checkAccountStatus);
app.get('/api/restaurants/:id/stripe/refresh', verifyToken, stripeRoutes.refreshOnboardingLink);

// Products & Payments
app.get('/api/products', verifyToken, productRoutes.getProducts);
app.post('/api/checkout', verifyToken, paymentRoutes.createCheckoutSession);
app.post('/api/payments/checkout-menu', paymentRoutes.createMenuCheckoutSession);

// Menu Management
app.get('/api/restaurants/:restaurantId/menu', verifyToken, menuRoutes.getMenuItems);
app.get('/api/public/restaurants/:restaurantId/menu', menuRoutes.getPublicMenu);
app.get('/api/public/menus/:token', menuRoutes.getPublicMenuByToken);
app.post('/api/restaurants/:restaurantId/menu', verifyToken, menuRoutes.createMenuItem);
app.post('/api/restaurants/:restaurantId/menu/token', verifyToken, menuRoutes.generateMenuToken);
app.put('/api/restaurants/:restaurantId/menu/:itemId', verifyToken, menuRoutes.updateMenuItem);
app.delete('/api/restaurants/:restaurantId/menu/:itemId', verifyToken, menuRoutes.deleteMenuItem);

// QR Code Generation
app.post('/api/generate-qr', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL required' });
    }
    const qrCode = await QRCode.toDataURL(url, { width: 300, margin: 2 });
    res.json({ qrCode });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

app.get('/api/restaurants/:restaurantId/qrcode', verifyToken, async (req, res) => {
  try {
    const restaurantId = req.params.restaurantId;
    const publicUrl = `${process.env.REDIRECT_URL || 'http://localhost:3000'}/public/menu/${restaurantId}`;
    const qrCode = await QRCode.toDataURL(publicUrl, { width: 300, margin: 2 });
    res.json({ qrCode, publicUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Static pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/signup', (req, res) => res.sendFile(path.join(__dirname, 'public', 'signup.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));
app.get('/restaurants', (req, res) => res.sendFile(path.join(__dirname, 'public', 'restaurants.html')));
app.get('/restaurants/:id', (req, res) => res.sendFile(path.join(__dirname, 'public', 'restaurant-detail.html')));
app.get('/restaurants/:id/stripe/refresh', (req, res) => res.sendFile(path.join(__dirname, 'public', 'stripe-refresh.html')));
app.get('/restaurants/:id/stripe/return', (req, res) => res.sendFile(path.join(__dirname, 'public', 'stripe-return.html')));
app.get('/menu', (req, res) => res.sendFile(path.join(__dirname, 'public', 'menu.html')));
app.get('/checkout/success', (req, res) => res.sendFile(path.join(__dirname, 'public', 'checkout-success.html')));
app.get('/checkout/cancel', (req, res) => res.sendFile(path.join(__dirname, 'public', 'checkout-cancel.html')));
app.get('/restaurants/:id/menu-manager', (req, res) => res.sendFile(path.join(__dirname, 'public', 'menu-manager.html')));
app.get('/public/menu/:token', (req, res) => res.sendFile(path.join(__dirname, 'public', 'public-menu.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
