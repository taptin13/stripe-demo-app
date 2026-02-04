const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getDB } = require('../db');

// Sign up user
const signup = (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const db = getDB();

  db.run(
    'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
    [email, hashedPassword, name],
    function(err) {
      if (err) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      const token = jwt.sign({ userId: this.lastID }, process.env.JWT_SECRET);
      res.cookie('token', token, { httpOnly: true });
      res.json({
        success: true,
        message: 'User created successfully',
        userId: this.lastID
      });
    }
  );
};

// Login user
const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const db = getDB();
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err || !user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    res.cookie('token', token, { httpOnly: true });
    res.json({
      success: true,
      message: 'Login successful',
      userId: user.id
    });
  });
};

// Get current user
const getCurrentUser = (req, res) => {
  const db = getDB();
  db.get('SELECT id, email, name FROM users WHERE id = ?', [req.userId], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  });
};

// Logout user
const logout = (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
};

module.exports = { signup, login, getCurrentUser, logout };
