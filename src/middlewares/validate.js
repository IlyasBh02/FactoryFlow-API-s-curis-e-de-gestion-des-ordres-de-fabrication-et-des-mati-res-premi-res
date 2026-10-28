const AppError = require('../utils/AppError');

// source = 'body' (par défaut) ou 'query'.
// Avec Express 5, req.query n'est pas modifiable : la query validée est dans req.validatedQuery.
module.exports = (schema, source = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[source], {
    abortEarly: false,
    stripUnknown: true,
  });
  if (error) {
    return next(new AppError('Données invalides', 422, error.details.map((d) => d.message)));
  }
  if (source === 'body') req.body = value;
  else req.validatedQuery = value;
  next();
};
