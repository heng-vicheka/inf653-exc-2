const bcrypt = require('bcryptjs');

// In-memory store
const users = [
  {
    id: 1,
    username: 'demo',
    email: 'demo@example.com',
    password: bcrypt.hashSync('password123', 10),
  },
];
let nextId = 2;

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
