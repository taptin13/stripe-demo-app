const { getDB } = require('../db');

// List all products
const getProducts = (req, res) => {
  const db = getDB();
  db.all('SELECT * FROM products ORDER BY id ASC', (err, products) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch products' });
    }
    res.json(products);
  });
};

module.exports = { getProducts };
