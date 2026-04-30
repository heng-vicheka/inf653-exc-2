require('dotenv').config();
const express = require('express');
const path = require('node:path');
const { engine } = require('express-handlebars');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');

const authRoutes = require('./routes/authRoutes');
const apiAuthRoutes = require('./routes/apiAuthRoutes');
const recordRoutes = require('./routes/recordRoutes');
const { requireSession } = require('./middleware/sessionAuth');
const recordModel = require('./models/recordModel');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Template Engine ───────────────────────────────────────────────────────────
app.engine(
  'hbs',
  engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views/partials'),
    helpers: {
      eq: (a, b) => a === b,
    },
  })
);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// ── Core Middleware ───────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

// ── Session ───────────────────────────────────────────────────────────────────
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'fallback_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, secure: false, maxAge: 1000 * 60 * 60 * 24 },
  })
);

// ── CSRF (web routes only) ────────────────────────────────────────────────────
const csrfProtection = csrf({ cookie: true });

// Expose session.user to every HBS template
app.use((req, res, next) => {
  res.locals.session = { user: req.session.user || null };
  next();
});

// ── API Routes (no CSRF — protected by JWT instead) ──────────────────────────
app.use('/api', apiAuthRoutes);

// ── Web Routes (CSRF applied) ─────────────────────────────────────────────────
app.use(csrfProtection);
app.use('/', authRoutes);
app.use('/records', requireSession, recordRoutes);

// Protected web route — teammates will add fuel-record routes here
app.get('/dashboard', requireSession, (req, res) => {
  const userId = Number(req.session.user.id);
  const list = recordModel.getRecordsByUser(userId).map((record) => ({
    ...record,
    kmPerLiter: recordModel.computeKmPerLiter(record),
  }));

  res.render('dashboard', {
    title: 'Dashboard',
    csrfToken: req.csrfToken(),
    records: {
      list,
      weeklySummary: recordModel.summarizeByWeek(list),
      monthlySummary: recordModel.summarizeByMonth(list),
    },
  });
});

app.get('/reports', requireSession, (req, res) => {
  const userId = Number(req.session.user.id);
  const list = recordModel.getRecordsByUser(userId).map((record) => ({
    ...record,
    kmPerLiter: recordModel.computeKmPerLiter(record),
  }));

  res.render('reports', {
    title: 'Reports',
    records: {
      weeklySummary: recordModel.summarizeByWeek(list),
      monthlySummary: recordModel.summarizeByMonth(list),
    },
  });
});

// Root redirect
app.get('/', (req, res) => {
  res.redirect(req.session.user ? '/dashboard' : '/login');
});

// ── CSRF Error Handler ────────────────────────────────────────────────────────
app.use((err, _req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).send('Invalid CSRF token. Please go back and try again.');
  }
  next(err);
});

// ── Generic Error Handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).send('Internal Server Error');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
