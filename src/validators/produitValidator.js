const Joi = require('joi');

const objectId = Joi.string().hex().length(24);

const compositionSchema = Joi.array()
  .items(
    Joi.object({
      matiere: objectId.required(),
      quantite: Joi.number().greater(0).required(), // strictement positive
    })
  )
  .min(1)
  .unique('matiere')
  .messages({
    'array.min': 'Un produit doit utiliser au moins une matière première',
    'array.unique': 'Une matière ne peut figurer qu\'une seule fois dans la composition',
  });

const createSchema = Joi.object({
  reference: Joi.string().trim().required(),
  name: Joi.string().trim().min(2).required(),
  description: Joi.string().trim().allow('').default(''),
  composition: compositionSchema.required(),
});

const updateSchema = Joi.object({
  reference: Joi.string().trim(),
  name: Joi.string().trim().min(2),
  description: Joi.string().trim().allow(''),
  composition: compositionSchema,
}).min(1);

const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

module.exports = { createSchema, updateSchema, listQuerySchema };
