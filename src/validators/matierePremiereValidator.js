const Joi = require('joi');

const createSchema = Joi.object({
  reference: Joi.string().trim().required(),
  name: Joi.string().trim().min(2).required(),
  unite: Joi.string().trim().required(),
  seuilAlerte: Joi.number().min(0).default(0),
  stockInitial: Joi.number().min(0).default(0),
});

const updateSchema = Joi.object({
  reference: Joi.string().trim(),
  name: Joi.string().trim().min(2),
  unite: Joi.string().trim(),
  seuilAlerte: Joi.number().min(0),
}).min(1);

module.exports = { createSchema, updateSchema };
