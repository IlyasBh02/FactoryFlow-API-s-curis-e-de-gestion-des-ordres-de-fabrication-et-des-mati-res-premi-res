const mongoose = require('mongoose');
const Stock = require('../models/Stock');
const { MOVEMENT_TYPE } = require('../utils/constants');

const create = (data, session) =>
  Stock.create([data], { session }).then(([stock]) => stock);

const findByMatiere = (matiereId, session) =>
  Stock.findOne({ matiere: matiereId }).session(session || null);

// Entrée de stock : quantité augmentée et mouvement ajouté en UNE opération atomique.
// Retourne null si la matière n'a pas de stock (donc n'existe pas).
const addEntry = (matiereId, quantite, userId, session) =>
  Stock.findOneAndUpdate(
    { matiere: matiereId },
    {
      $inc: { quantite },
      $push: {
        mouvements: { type: MOVEMENT_TYPE.ENTRY, quantite, user: userId, createdAt: new Date() },
      },
    },
    { returnDocument: 'after', runValidators: true, session, projection: { mouvements: { $slice: -1 } } }
  );

// Historique des mouvements, filtré et paginé
const listMovements = async ({ matiere, type, page, limit }) => {
  const pipeline = [
    { $match: matiere ? { matiere: new mongoose.Types.ObjectId(matiere) } : {} },
    { $unwind: '$mouvements' },
    ...(type ? [{ $match: { 'mouvements.type': type } }] : []),
    { $sort: { 'mouvements.createdAt': -1 } },
    {
      $facet: {
        items: [
          { $skip: (page - 1) * limit },
          { $limit: limit },
          {
            $lookup: {
              from: 'matieres_premieres',
              localField: 'matiere',
              foreignField: '_id',
              as: 'matiere',
            },
          },
          { $unwind: '$matiere' },
          {
            $lookup: {
              from: 'users',
              localField: 'mouvements.user',
              foreignField: '_id',
              as: 'user',
            },
          },
          { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: 0,
              type: '$mouvements.type',
              quantite: '$mouvements.quantite',
              order: '$mouvements.order',
              createdAt: '$mouvements.createdAt',
              matiere: {
                _id: '$matiere._id',
                reference: '$matiere.reference',
                name: '$matiere.name',
                unite: '$matiere.unite',
              },
              user: { _id: '$user._id', name: '$user.name' },
            },
          },
        ],
        total: [{ $count: 'count' }],
      },
    },
  ];

  const [result] = await Stock.aggregate(pipeline);
  return { items: result.items, total: result.total[0]?.count || 0, page, limit };
};

// Stocks dont la quantité est inférieure ou égale au seuil d'alerte de la matière
const findBelowThreshold = () =>
  Stock.aggregate([
    { $project: { mouvements: 0 } },
    {
      $lookup: {
        from: 'matieres_premieres',
        localField: 'matiere',
        foreignField: '_id',
        as: 'matiere',
      },
    },
    { $unwind: '$matiere' },
    { $match: { $expr: { $lte: ['$quantite', '$matiere.seuilAlerte'] } } },
    { $sort: { quantite: 1 } },
  ]);

module.exports = { create, findByMatiere, addEntry, listMovements, findBelowThreshold };
