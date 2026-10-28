const AppError = require('../utils/AppError');

// Utilisation : authorize(ROLES.ADMIN) ou authorize(ROLES.ADMIN, ROLES.OPERATOR)
// À placer APRÈS authenticate, qui remplit req.user.
module.exports = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Authentification requise', 401));
  }
  if (!allowedRoles.includes(req.user.role)) {
    return next(new AppError('Accès refusé : permissions insuffisantes', 403));
  }
  next();
};
