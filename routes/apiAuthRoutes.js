const express = require('express');
const router = express.Router();
const apiAuthController = require('../controllers/apiAuthController');
const { requireJWT } = require('../middleware/jwtAuth');

router.post('/login', apiAuthController.login);
router.post('/register', apiAuthController.register);
router.get('/me', requireJWT, apiAuthController.me);

module.exports = router;
