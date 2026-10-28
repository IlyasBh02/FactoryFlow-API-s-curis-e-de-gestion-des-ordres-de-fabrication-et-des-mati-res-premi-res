const AppError = require('../utils/AppError');
const stockRepository = require('../repositories/stockRepository');

const addEntry = async ({ matiere, quantite }, userId) => {
  const stock = await stockRepository.addEntry(matiere, quantite, userId);
  if (!stock) throw new AppError('Matière première introuvable', 404);
  return stock;
};

const listMovements = (query) => stockRepository.listMovements(query);

module.exports = { addEntry, listMovements };
