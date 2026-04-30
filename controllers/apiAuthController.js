const jwt = require('jsonwebtoken');
const UserModel = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret';
const JWT_EXPIRES_IN = '24h';

// POST /api/login
exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  const user = UserModel.findByUsername(username);
  if (!user || !(await UserModel.verifyPassword(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const payload = { id: user.id, username: user.username };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  res.json({ message: 'Login successful.', token });
};

// POST /api/register
exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email, and password are required.' });
  }

  if (UserModel.findByUsername(username)) {
    return res.status(409).json({ message: 'Username already taken.' });
  }

  if (UserModel.findByEmail(email)) {
    return res.status(409).json({ message: 'Email already registered.' });
  }

  const user = await UserModel.create({ username, email, password });
  res.status(201).json({ message: 'User created successfully.', user: UserModel.safeUser(user) });
};

// GET /api/me  (protected)
exports.me = (req, res) => {
  res.json({ user: req.user });
};
