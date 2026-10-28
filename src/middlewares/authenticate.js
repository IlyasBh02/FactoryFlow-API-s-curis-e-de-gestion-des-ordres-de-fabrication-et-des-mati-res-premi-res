const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const { jwtSecret } = require('../config/env');

module.exports = (req, res, next) => {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(new AppError('Authentification requise', 401));
  }
  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (err) {
    next(err); 
  }
};
