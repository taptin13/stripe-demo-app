const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { getDB } = require('../db');

// Create Stripe Checkout Session for a product
const createCheckoutSession = async (req, res) => {
  try {
    const { productId, restaurantId } = req.body;
    const userId = req.userId;

    if (!productId || !restaurantId) {
      return res.status(400).json({ error: 'productId and restaurantId are required' });
    }

    const db = getDB();

    db.get(
      'SELECT * FROM restaurants WHERE id = ? AND user_id = ?',
      [restaurantId, userId],
      (err, restaurant) => {
        if (err || !restaurant) {
          return res.status(404).json({ error: 'Restaurant not found' });
        }

        if (!restaurant.stripe_account_id) {
          return res.status(400).json({ error: 'Restaurant is not connected to Stripe yet' });
        }

        db.get('SELECT * FROM products WHERE id = ?', [productId], async (err, product) => {
          if (err || !product) {
            return res.status(404).json({ error: 'Product not found' });
          }

          try {
            // Create checkout session directly on the connected account
            // This is the recommended approach for Express accounts
            const session = await stripe.checkout.sessions.create({
              mode: 'payment',
              payment_method_types: ['card', 'twint'],
              line_items: [
                {
                  price_data: {
                    currency: product.currency || 'chf',
                    product_data: {
                      name: product.name,
                      description: product.description || undefined
                    },
                    unit_amount: product.price_cents
                  },
                  quantity: 1
                }
              ],
              locale: 'de',
              success_url: `${process.env.REDIRECT_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
              cancel_url: `${process.env.REDIRECT_URL || 'http://localhost:3000'}/checkout/cancel`,
              metadata: {
                restaurant_id: String(restaurantId),
                product_id: String(productId),
                user_id: String(userId)
              }
            }, {
              stripeAccount: restaurant.stripe_account_id
            });

            res.json({
              success: true,
              checkout_url: session.url
            });
          } catch (error) {
            res.status(400).json({ error: error.message });
          }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create Stripe Checkout Session for menu items (public - no auth)
const createMenuCheckoutSession = async (req, res) => {
  try {
    const { restaurant_id, items } = req.body;

    if (!restaurant_id || !items || items.length === 0) {
      return res.status(400).json({ error: 'restaurant_id and items are required' });
    }

    const db = getDB();

    db.get(
      'SELECT * FROM restaurants WHERE id = ?',
      [restaurant_id],
      async (err, restaurant) => {
        if (err || !restaurant) {
          return res.status(404).json({ error: 'Restaurant not found' });
        }

        if (!restaurant.stripe_account_id) {
          return res.status(400).json({ error: 'Restaurant is not connected to Stripe yet' });
        }

        // Note: In test mode, we allow payments even if onboarding not complete
        // if (!restaurant.stripe_charges_enabled) {
        //   return res.status(400).json({ error: 'Restaurant cannot accept payments yet. Please complete onboarding.' });
        // }

        try {
          // Create line items from menu items
          const lineItems = items.map(item => ({
            price_data: {
              currency: 'chf',
              product_data: {
                name: item.name
              },
              unit_amount: item.price
            },
            quantity: item.quantity
          }));

          // Create checkout session on connected account
          const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card', 'twint'],
            line_items: lineItems,
            locale: 'de',
            success_url: `${process.env.REDIRECT_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.REDIRECT_URL || 'http://localhost:3000'}/public/menu/${restaurant_id}`,
            metadata: {
              restaurant_id: String(restaurant_id)
            }
          }, {
            stripeAccount: restaurant.stripe_account_id
          });

          res.json({
            success: true,
            url: session.url
          });
        } catch (error) {
          console.error('Stripe error:', error);
          res.status(400).json({ error: error.message });
        }
      }
    );
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createCheckoutSession, createMenuCheckoutSession };
