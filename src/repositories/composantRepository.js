const Composant = require('../models/Composant');

const createMany = (items, session) => Composant.create(items, { session, ordered: true });

const deleteByProduit = (produitId, session) =>
  Composant.deleteMany({ produit: produitId }, { session });

const findByProduit = (produitId) =>
  Composant.find({ produit: produitId })
    .populate({ path: 'matiere', select: 'reference name unite' })
    .select('-produit');

const findByProduits = (produitIds) =>
  Composant.find({ produit: { $in: produitIds } })
    .populate({ path: 'matiere', select: 'reference name unite' });

module.exports = { createMany, deleteByProduit, findByProduit, findByProduits };
