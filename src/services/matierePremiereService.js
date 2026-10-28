const AppError = require('../utils/AppError');
const { MOVEMENT_TYPE } = require('../utils/constants');
const { runInTransaction } = require('../utils/transaction');
const matiereRepository = require('../repositories/matierePremiereRepository');
const stockRepository = require('../repositories/stockRepository');

// Crée la matière et son stock unique (avec l'entrée initiale si besoin) : tout ou rien.
const create = async ({ stockInitial = 0, ...data }, userId) => {
  const matiere = await runInTransaction(async (session) => {
    const created = await matiereRepository.create(data, session);
    await stockRepository.create(
      {
        matiere: created._id,
        quantite: stockInitial,
        mouvements:
          stockInitial > 0
            ? [{ type: MOVEMENT_TYPE.ENTRY, quantite: stockInitial, user: userId }]
            : [],
      },
      session
    );
    return created;
  });
  return matiereRepository.findById(matiere._id);
};

const list = () => matiereRepository.findAll();

const getById = async (id) => {
  const matiere = await matiereRepository.findById(id);
  if (!matiere) throw new AppError('Matière première introuvable', 404);
  return matiere;
};

// La quantité ne se modifie jamais ici : uniquement par les entrées et sorties de stock
const update = async (id, data) => {
  const matiere = await matiereRepository.updateById(id, data);
  if (!matiere) throw new AppError('Matière première introuvable', 404);
  return matiere;
};

const getBelowThreshold = () => stockRepository.findBelowThreshold();

module.exports = { create, list, getById, update, getBelowThreshold };
