# Quick Setup Guide

## 🚀 Getting Started in 3 Minutes

### 1. Install Dependencies (Already Done! ✓)
```bash
npm install
```

### 2. Configure Stripe Keys

**Important:** You need to add your Stripe API keys to the `.env` file.

#### Get Your Stripe Keys:

1. Go to **[Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)**
2. Make sure you're in **Test Mode** (toggle in top-right)
3. Copy your keys:
   - **Secret key** (starts with `sk_test_...`)
   - **Publishable key** (starts with `pk_test_...`)

#### Add Keys to `.env` file:

Open the `.env` file in this directory and replace the placeholder values:

```env
STRIPE_SECRET_KEY=sk_test_51xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxxxxxxxxxx
JWT_SECRET=your_random_long_secret_string_here
NODE_ENV=development
PORT=3000
```

For `JWT_SECRET`, use any random string (e.g., `my_super_secret_jwt_key_12345`)

### 3. Start the Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

### 4. Open in Browser

Navigate to: **http://localhost:3000**

---

## 📝 Testing the Demo

### Step 1: Create an Account
1. Click **"Sign Up"**
2. Enter your name, email, and password
3. You'll be redirected to the dashboard

### Step 2: Register a Restaurant
1. Click **"Create Restaurant"**
2. Fill in the restaurant details:
   - Name: "Test Restaurant"
   - Email: "test@restaurant.com"
   - Phone: "555-0100"
   - Address: "123 Main St"
   - City: "San Francisco"
   - State: "CA"
   - Postal Code: "94102"
   - Country: "US"
3. Click **"Register Restaurant"**

### Step 3: Connect Stripe Account
1. From the dashboard, click on your restaurant
2. Click **"Create Stripe Account"**
3. You'll be redirected to Stripe's onboarding
4. Use these test values:

**For Individual/Company:**
- First name: John
- Last name: Doe
- Phone: +1 415-555-0100
- Email: test@example.com

**For Business Address:**
- Address: 123 Test St
- City: San Francisco
- State: California
- Postal Code: 94102

**For Verification (if asked):**
- SSN: 000-00-0000
- Date of birth: 01/01/1990

**For Bank Account:**
- Routing: 110000000
- Account: 000123456789

5. Complete the onboarding flow
6. Return to the app to see your account status

### Step 4: Check Status
- View **Charges Enabled**: Should show ✓ Yes
- View **Payouts Enabled**: Should show ✓ Yes
- Status should be: **✓ Active**

---

## 🔧 Troubleshooting

### "Server already running" error
```bash
# Kill the process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Database issues
```bash
# Delete and restart (will lose data)
rm stripe_demo.db
npm start
```

### Stripe API errors
- Make sure you're using **Test Mode** keys
- Check that keys are correctly pasted in `.env`
- Restart the server after changing `.env`

### Authentication issues
- Clear browser cookies
- Try logging out and back in
- Check browser console for errors

---

## 🎯 What This Demo Shows

✅ User signup and authentication with JWT  
✅ Restaurant profile management  
✅ Stripe Connect Express account creation  
✅ Onboarding flow integration  
✅ Account status monitoring  
✅ Charges and payouts capabilities  

---

## 📚 Next Steps

Once you've tested the basic flow, you can:

1. **Add Payment Processing**
   - Create charges on connected accounts
   - Implement transfer logic

2. **Add Webhooks**
   - Listen for account updates
   - Handle verification events

3. **Enhance UI**
   - Add payment forms
   - Show transaction history

4. **Add Features**
   - Multi-currency support
   - Payout scheduling
   - Fee structures

---

## 🔑 API Endpoints Reference

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Login
- `GET /api/auth/user` - Get current user info

### Restaurants
- `POST /api/restaurants` - Create restaurant
- `GET /api/restaurants` - List all user's restaurants
- `GET /api/restaurants/:id` - Get specific restaurant

### Stripe Connect
- `POST /api/restaurants/:id/stripe/create` - Create Stripe account
- `GET /api/restaurants/:id/stripe/status` - Check account status
- `GET /api/restaurants/:id/stripe/refresh` - Refresh onboarding link

---

## 💡 Test Card Numbers

For testing payments (future feature):
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **3D Secure**: 4000 0025 0000 3155

Use any future expiry date, any 3-digit CVC, any postal code.

---

## 📖 Resources

- [Stripe Connect Docs](https://stripe.com/docs/connect)
- [Express Accounts Guide](https://stripe.com/docs/connect/express-accounts)
- [Testing Guide](https://stripe.com/docs/connect/testing)

---

**Ready to start? Open http://localhost:3000 and create your first account!** 🎉
