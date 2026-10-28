const Joi = require('joi');
const { MOVEMENT_TYPE } = require('../utils/constants');

const objectId = Joi.string().hex().length(24);

const entrySchema = Joi.object({
  matiere: objectId.required(),
  quantite: Joi.number().greater(0).required(), // strictement positive
});

const movementsQuerySchema = Joi.object({
  matiere: objectId,
  type: Joi.string().valid(...Object.values(MOVEMENT_TYPE)),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

module.exports = { entrySchema, movementsQuerySchema };
