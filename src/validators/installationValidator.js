const Joi = require('joi');

const installSchema = Joi.object({
  name: Joi.string().trim().min(2).required(),
  email: Joi.string().trim().lowercase().email({ tlds: { allow: false } }).required(),
  password: Joi.string().min(8).required(),
});

module.exports = { installSchema };