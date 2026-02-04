const { getDB } = require('../db');

// Create new restaurant
const createRestaurant = (req, res) => {
  const { name, email, phone, address, city, state, postal_code, country } = req.body;
  const userId = req.userId;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const db = getDB();
  db.run(
    `INSERT INTO restaurants (user_id, name, email, phone, address, city, state, postal_code, country)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, name, email, phone || null, address || null, city || null, state || null, postal_code || null, country || 'CH'],
    function(err) {
      if (err) {
        return res.status(400).json({ error: 'Failed to create restaurant' });
      }

      res.json({
        success: true,
        message: 'Restaurant created successfully',
        restaurantId: this.lastID
      });
    }
  );
};

// Get user's restaurants
const getRestaurants = (req, res) => {
  const userId = req.userId;
  const db = getDB();

  db.all('SELECT * FROM restaurants WHERE user_id = ?', [userId], (err, restaurants) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch restaurants' });
    }
    res.json(restaurants);
  });
};

// Get single restaurant
const getRestaurant = (req, res) => {
  const restaurantId = req.params.id;
  const userId = req.userId;

  const db = getDB();
  db.get(
    'SELECT * FROM restaurants WHERE id = ? AND user_id = ?',
    [restaurantId, userId],
    (err, restaurant) => {
      if (err || !restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }
      res.json(restaurant);
    }
  );
};

// Update restaurant
const updateRestaurant = (req, res) => {
  const restaurantId = req.params.id;
  const userId = req.userId;
  const { name, email, phone, address, city, state, postal_code, country } = req.body;

  const db = getDB();
  db.run(
    `UPDATE restaurants 
     SET name = ?, email = ?, phone = ?, address = ?, city = ?, state = ?, postal_code = ?, country = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ? AND user_id = ?`,
    [name, email, phone || null, address || null, city || null, state || null, postal_code || null, country || 'CH', restaurantId, userId],
    (err) => {
      if (err) {
        return res.status(400).json({ error: 'Failed to update restaurant' });
      }
      res.json({ success: true, message: 'Restaurant updated successfully' });
    }
  );
};

// Delete restaurant
const deleteRestaurant = (req, res) => {
  const restaurantId = req.params.id;
  const userId = req.userId;

  const db = getDB();
  db.run(
    'DELETE FROM restaurants WHERE id = ? AND user_id = ?',
    [restaurantId, userId],
    (err) => {
      if (err) {
        return res.status(400).json({ error: 'Failed to delete restaurant' });
      }
      res.json({ success: true, message: 'Restaurant deleted successfully' });
    }
  );
};

module.exports = {
  createRestaurant,
  getRestaurants,
  getRestaurant,
  updateRestaurant,
  deleteRestaurant
};
