const UserModel = require('../models/User');

// GET /login
exports.getLogin = (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.render('auth/login', {
    title: 'Login',
    csrfToken: req.csrfToken(),
    error: req.session.flash,
    layout: 'main',
  });
  delete req.session.flash;
};

// POST /login
exports.postLogin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    req.session.flash = 'Username and password are required.';
    return res.redirect('/login');
  }

  const user = UserModel.findByUsername(username);
  if (!user || !(await UserModel.verifyPassword(password, user.password))) {
    req.session.flash = 'Invalid username or password.';
    return res.redirect('/login');
  }

  req.session.user = UserModel.safeUser(user);
  res.redirect('/dashboard');
};

// GET /register
exports.getRegister = (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.render('auth/register', {
    title: 'Register',
    csrfToken: req.csrfToken(),
    error: req.session.flash,
    layout: 'main',
  });
  delete req.session.flash;
};

// POST /register
exports.postRegister = async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  if (!username || !email || !password || !confirmPassword) {
    req.session.flash = 'All fields are required.';
    return res.redirect('/register');
  }

  if (password !== confirmPassword) {
    req.session.flash = 'Passwords do not match.';
    return res.redirect('/register');
  }

  if (UserModel.findByUsername(username)) {
    req.session.flash = 'Username already taken.';
    return res.redirect('/register');
  }

  if (UserModel.findByEmail(email)) {
    req.session.flash = 'Email already registered.';
    return res.redirect('/register');
  }

  const user = await UserModel.create({ username, email, password });
  req.session.user = UserModel.safeUser(user);
  res.redirect('/dashboard');
};

// POST /logout
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
};
