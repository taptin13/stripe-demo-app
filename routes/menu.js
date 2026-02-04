const { getDB } = require('../db');
const { randomUUID } = require('crypto');

// Get restaurant's menu items
const getMenuItems = (req, res) => {
  const restaurantId = req.params.restaurantId;
  const userId = req.userId;

  const db = getDB();
  
  // Verify restaurant belongs to user
  db.get(
    'SELECT * FROM restaurants WHERE id = ? AND user_id = ?',
    [restaurantId, userId],
    (err, restaurant) => {
      if (err || !restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }

      db.all(
        'SELECT * FROM menu_items WHERE restaurant_id = ? ORDER BY category, name',
        [restaurantId],
        (err, items) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to fetch menu items' });
          }
          
          // Get or create menu token for this restaurant
          db.get(
            'SELECT public_token FROM menu_tokens WHERE restaurant_id = ? LIMIT 1',
            [restaurantId],
            (err, token) => {
              let publicToken = token?.public_token || null;
              res.json({ items, publicToken });
            }
          );
        }
      );
    }
  );
};

// Get public menu by token (no auth required)
const getPublicMenuByToken = (req, res) => {
  const token = req.params.token;
  const db = getDB();

  db.get(
    'SELECT restaurant_id FROM menu_tokens WHERE public_token = ?',
    [token],
    (err, row) => {
      if (err || !row) {
        return res.status(404).json({ error: 'Menu not found' });
      }

      const restaurantId = row.restaurant_id;
      
      db.get(
        'SELECT id, name, email, phone, address, city, state FROM restaurants WHERE id = ?',
        [restaurantId],
        (err, restaurant) => {
          if (err || !restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
          }

          db.all(
            'SELECT * FROM menu_items WHERE restaurant_id = ? AND available = 1 ORDER BY category, name',
            [restaurantId],
            (err, items) => {
              if (err) {
                return res.status(500).json({ error: 'Failed to fetch menu' });
              }
              res.json({
                restaurant,
                menu: items
              });
            }
          );
        }
      );
    }
  );
};

// Get public menu (no auth required) - DEPRECATED but keep for backward compatibility
const getPublicMenu = (req, res) => {
  const restaurantId = req.params.restaurantId;
  const db = getDB();

  db.get('SELECT id, name, email, phone, address, city, state FROM restaurants WHERE id = ?', [restaurantId], (err, restaurant) => {
    if (err || !restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    db.all(
      'SELECT * FROM menu_items WHERE restaurant_id = ? AND available = 1 ORDER BY category, name',
      [restaurantId],
      (err, items) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to fetch menu' });
        }
        res.json({
          restaurant,
          menu: items
        });
      }
    );
  });
};

// Create menu item
const createMenuItem = (req, res) => {
  const restaurantId = req.params.restaurantId;
  const userId = req.userId;
  const { name, description, price_cents, currency, category, image_url } = req.body;

  if (!name || !price_cents) {
    return res.status(400).json({ error: 'Name and price are required' });
  }

  const db = getDB();

  // Verify restaurant belongs to user
  db.get(
    'SELECT * FROM restaurants WHERE id = ? AND user_id = ?',
    [restaurantId, userId],
    (err, restaurant) => {
      if (err || !restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }

      // Ensure restaurant has a public token
      db.get(
        'SELECT public_token FROM menu_tokens WHERE restaurant_id = ?',
        [restaurantId],
        (err, tokenRow) => {
          if (!tokenRow) {
            const newToken = randomUUID();
            db.run(
              'INSERT INTO menu_tokens (restaurant_id, public_token) VALUES (?, ?)',
              [restaurantId, newToken],
              (err) => {
                if (err) console.error('Failed to create menu token:', err);
              }
            );
          }

          db.run(
            `INSERT INTO menu_items (restaurant_id, name, description, price_cents, currency, category, image_url)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [restaurantId, name, description || null, price_cents, currency || 'chf', category || null, image_url || null],
            function(err) {
              if (err) {
                return res.status(400).json({ error: 'Failed to create menu item' });
              }
              res.json({
                success: true,
                message: 'Menu item created',
                itemId: this.lastID
              });
            }
          );
        }
      );
    }
  );
};

// Generate or refresh public token for restaurant
const generateMenuToken = (req, res) => {
  const restaurantId = req.params.restaurantId;
  const userId = req.userId;
  const db = getDB();

  // Verify restaurant belongs to user
  db.get(
    'SELECT * FROM restaurants WHERE id = ? AND user_id = ?',
    [restaurantId, userId],
    (err, restaurant) => {
      if (err || !restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }

      const newToken = randomUUID();
      
      // Delete old token first
      db.run(
        'DELETE FROM menu_tokens WHERE restaurant_id = ?',
        [restaurantId],
        (err) => {
          if (err) console.error('Failed to delete old token:', err);
          
          // Insert new token
          db.run(
            'INSERT INTO menu_tokens (restaurant_id, public_token) VALUES (?, ?)',
            [restaurantId, newToken],
            (err) => {
              if (err) {
                return res.status(400).json({ error: 'Failed to generate token' });
              }
              res.json({
                success: true,
                publicToken: newToken,
                publicUrl: `${process.env.REDIRECT_URL || 'http://localhost:3000'}/public/menu/${newToken}`
              });
            }
          );
        }
      );
    }
  );
};

// Update menu item
const updateMenuItem = (req, res) => {
  const { restaurantId, itemId } = req.params;
  const userId = req.userId;
  const { name, description, price_cents, currency, category, image_url, available } = req.body;

  const db = getDB();

  // Verify restaurant belongs to user
  db.get(
    'SELECT * FROM restaurants WHERE id = ? AND user_id = ?',
    [restaurantId, userId],
    (err, restaurant) => {
      if (err || !restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }

      db.run(
        `UPDATE menu_items 
         SET name = ?, description = ?, price_cents = ?, currency = ?, category = ?, image_url = ?, available = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ? AND restaurant_id = ?`,
        [name, description || null, price_cents, currency || 'chf', category || null, image_url || null, available !== undefined ? available : 1, itemId, restaurantId],
        (err) => {
          if (err) {
            return res.status(400).json({ error: 'Failed to update menu item' });
          }
          res.json({ success: true, message: 'Menu item updated' });
        }
      );
    }
  );
};

// Delete menu item
const deleteMenuItem = (req, res) => {
  const { restaurantId, itemId } = req.params;
  const userId = req.userId;

  const db = getDB();

  // Verify restaurant belongs to user
  db.get(
    'SELECT * FROM restaurants WHERE id = ? AND user_id = ?',
    [restaurantId, userId],
    (err, restaurant) => {
      if (err || !restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }

      db.run(
        'DELETE FROM menu_items WHERE id = ? AND restaurant_id = ?',
        [itemId, restaurantId],
        (err) => {
          if (err) {
            return res.status(400).json({ error: 'Failed to delete menu item' });
          }
          res.json({ success: true, message: 'Menu item deleted' });
        }
      );
    }
  );
};

module.exports = {
  getMenuItems,
  getPublicMenu,
  getPublicMenuByToken,
  createMenuItem,
  generateMenuToken,
  updateMenuItem,
  deleteMenuItem
};
