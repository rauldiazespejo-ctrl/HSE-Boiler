const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No autorizado. Token faltante.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded; // Attach user info to request
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token inválido o expirado.' });
  }
};

const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  const userRole = req.user?.rol;
  if (!userRole || !allowedRoles.includes(userRole)) {
    return res.status(403).json({
      success: false,
      message: 'No tienes permisos para realizar esta acción.'
    });
  }

  return next();
};

const optionalAuth = (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  try {
    const token = authHeader.split(' ')[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'secret');
  } catch (_error) {
    // Ignore optional token parsing errors on routes that do not require auth.
  }

  return next();
};

module.exports = {
  authMiddleware,
  authorizeRoles,
  optionalAuth,
};
