const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'stripe_demo.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
const initializeDB = () => {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Restaurants table
    db.run(`
      CREATE TABLE IF NOT EXISTS restaurants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        postal_code TEXT,
        country TEXT DEFAULT 'CH',
        stripe_account_id TEXT,
        stripe_charges_enabled BOOLEAN DEFAULT 0,
        stripe_payouts_enabled BOOLEAN DEFAULT 0,
        onboarding_link TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Products table (global menu items for demo)
    db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price_cents INTEGER NOT NULL,
        currency TEXT DEFAULT 'chf',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Restaurant menu items table
    db.run(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        restaurant_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        price_cents INTEGER NOT NULL,
        currency TEXT DEFAULT 'chf',
        category TEXT,
        image_url TEXT,
        available BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
      )
    `);

    // Menu tokens for public sharing
    db.run(`
      CREATE TABLE IF NOT EXISTS menu_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        restaurant_id INTEGER NOT NULL,
        public_token TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
      )
    `);

    // Seed menu items if empty
    db.get('SELECT COUNT(*) AS count FROM products', (err, row) => {
      if (err) {
        return;
      }
      if (row && row.count === 0) {
        const stmt = db.prepare(
          'INSERT INTO products (name, description, price_cents, currency) VALUES (?, ?, ?, ?)'
        );
        const seedItems = [
          ['Margherita Pizza', 'Classic tomato, mozzarella, basil', 1850, 'chf'],
          ['Spaghetti Carbonara', 'Pasta with pancetta, egg, parmesan', 2200, 'chf'],
          ['Caesar Salad', 'Romaine, croutons, parmesan', 1450, 'chf'],
          ['Cheeseburger', 'Beef patty, cheese, lettuce, tomato', 1950, 'chf'],
          ['Iced Latte', 'Espresso, milk, ice', 650, 'chf']
        ];
        seedItems.forEach((item) => stmt.run(item));
        stmt.finalize();
      }
    });
  });
};

const getDB = () => db;

module.exports = { initializeDB, getDB };
