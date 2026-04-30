const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'users.json');

function loadUsers() {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function saveUsers(users) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
}

let users = loadUsers();
let nextId = users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1;

const UserModel = {
  findByUsername(username) {
    return users.find((u) => u.username === username) || null;
  },

  findByEmail(email) {
    return users.find((u) => u.email === email) || null;
  },

  findById(id) {
    return users.find((u) => u.id === id) || null;
  },

  async create({ username, email, password }) {
    const hashed = await bcrypt.hash(password, 10);
    const user = { id: nextId++, username, email, password: hashed };
    users.push(user);
    saveUsers(users);
    return user;
  },

  async verifyPassword(plainText, hashed) {
    return bcrypt.compare(plainText, hashed);
  },

  safeUser(user) {
    const { password: _, ...safe } = user;
    return safe;
  },
};

module.exports = UserModel;
