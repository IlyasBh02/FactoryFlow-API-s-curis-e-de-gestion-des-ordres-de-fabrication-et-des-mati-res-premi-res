const AppError = require('../utils/AppError');

module.exports = (err, req, res, next) => {
  let error = err;

  if (err.name === 'ValidationError') {
    error = new AppError('Données invalides', 422, Object.values(err.errors).map(e => e.message));
  } else if (err.name === 'CastError') {
    error = new AppError('Identifiant invalide', 400);
  } else if (err.code === 11000) {
    error = new AppError('Valeur déjà existante', 409, err.keyValue);
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    error = new AppError('Token invalide ou expiré', 401);
  }

  const status = error.statusCode || 500;
  if (status === 500) console.error(err);

  res.status(status).json({
    status: 'error',
    message: status === 500 ? 'Erreur interne du serveur' : error.message,
    ...(error.details && { details: error.details }),
  });
};