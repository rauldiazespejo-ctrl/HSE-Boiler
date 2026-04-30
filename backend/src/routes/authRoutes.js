const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware, optionalAuth } = require('../middlewares/authMiddleware');

router.get('/usuarios', authController.listaUsuarios);
router.post('/login', authController.login);
router.post(
  '/register',
  optionalAuth,
  authController.requireRegistrationPrivileges,
  authController.register
);
router.get('/me', authMiddleware, authController.me);

module.exports = router;
