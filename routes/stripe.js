const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { getDB } = require('../db');

// Create express account and get onboarding link
const createStripeAccount = async (req, res) => {
  try {
    const restaurantId = req.params.id;
    const userId = req.userId;

    const db = getDB();
    
    // Verify restaurant belongs to user
    db.get(
      'SELECT * FROM restaurants WHERE id = ? AND user_id = ?',
      [restaurantId, userId],
      async (err, restaurant) => {
        if (err || !restaurant) {
          return res.status(404).json({ error: 'Restaurant not found' });
        }

        try {
          const businessProfile = {
            name: restaurant.name,
            url: `https://restaurant-platform.test/restaurants/${restaurantId}`
          };

          const supportAddress = {};
          if (restaurant.address) supportAddress.line1 = restaurant.address;
          if (restaurant.city) supportAddress.city = restaurant.city;
          if (restaurant.state) supportAddress.state = restaurant.state;
          if (restaurant.postal_code) supportAddress.postal_code = restaurant.postal_code;
          if (restaurant.country) supportAddress.country = restaurant.country;

          if (Object.keys(supportAddress).length > 0) {
            businessProfile.support_address = supportAddress;
          }

          // Create Stripe Express account
          const account = await stripe.accounts.create({
            type: 'express',
            country: restaurant.country || 'CH',
            email: restaurant.email,
            business_profile: businessProfile,
            capabilities: {
              card_payments: { requested: true },
              transfers: { requested: true },
              twint_payments: { requested: true }
            }
          });

          // Store Stripe account ID
          db.run(
            'UPDATE restaurants SET stripe_account_id = ? WHERE id = ?',
            [account.id, restaurantId],
            (err) => {
              if (err) {
                return res.status(500).json({ error: 'Failed to store account ID' });
              }

              // Generate onboarding link
              generateOnboardingLink(restaurantId, account.id, res);
            }
          );
        } catch (error) {
          res.status(400).json({ error: error.message });
        }
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Generate onboarding link
const generateOnboardingLink = async (restaurantId, stripeAccountId, res) => {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      type: 'account_onboarding',
      refresh_url: `${process.env.REDIRECT_URL || 'http://localhost:3000'}/restaurants/${restaurantId}/stripe/refresh`,
      return_url: `${process.env.REDIRECT_URL || 'http://localhost:3000'}/restaurants/${restaurantId}/stripe/return`
    });

    const db = getDB();
    db.run(
      'UPDATE restaurants SET onboarding_link = ? WHERE id = ?',
      [accountLink.url, restaurantId],
      (err) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to store onboarding link' });
        }
        res.json({
          success: true,
          onboarding_url: accountLink.url,
          stripe_account_id: stripeAccountId
        });
      }
    );
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Check account status
const checkAccountStatus = async (req, res) => {
  try {
    const restaurantId = req.params.id;
    const userId = req.userId;

    const db = getDB();
    db.get(
      'SELECT * FROM restaurants WHERE id = ? AND user_id = ?',
      [restaurantId, userId],
      async (err, restaurant) => {
        if (err || !restaurant) {
          return res.status(404).json({ error: 'Restaurant not found' });
        }

        if (!restaurant.stripe_account_id) {
          return res.json({ status: 'not_started' });
        }

        try {
          const account = await stripe.accounts.retrieve(restaurant.stripe_account_id);
          
          res.json({
            status: 'account_created',
            charges_enabled: account.charges_enabled,
            payouts_enabled: account.payouts_enabled,
            requirements: account.requirements,
            stripe_account_id: account.id
          });
        } catch (error) {
          res.status(400).json({ error: error.message });
        }
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Refresh onboarding link
const refreshOnboardingLink = async (req, res) => {
  try {
    const restaurantId = req.params.id;
    const userId = req.userId;

    const db = getDB();
    db.get(
      'SELECT * FROM restaurants WHERE id = ? AND user_id = ?',
      [restaurantId, userId],
      async (err, restaurant) => {
        if (err || !restaurant) {
          return res.status(404).json({ error: 'Restaurant not found' });
        }

        if (!restaurant.stripe_account_id) {
          return res.status(400).json({ error: 'Stripe account not created' });
        }

        try {
          generateOnboardingLink(restaurantId, restaurant.stripe_account_id, res);
        } catch (error) {
          res.status(400).json({ error: error.message });
        }
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createStripeAccount,
  checkAccountStatus,
  refreshOnboardingLink
};
