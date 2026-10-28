const Produit = require('../models/Produit');

const create = (data, session) =>
  Produit.create([data], { session }).then(([produit]) => produit);

const findPage = async ({ page, limit }) => {
  const [items, total] = await Promise.all([
    Produit.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Produit.countDocuments(),
  ]);
  return { items, total, page, limit };
};

const findById = (id) => Produit.findById(id);

const updateById = (id, data, session) =>
  Produit.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true, session });

module.exports = { create, findPage, findById, updateById };
