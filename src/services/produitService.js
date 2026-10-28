const AppError = require('../utils/AppError');
const { runInTransaction } = require('../utils/transaction');
const produitRepository = require('../repositories/produitRepository');
const composantRepository = require('../repositories/composantRepository');
const matiereRepository = require('../repositories/matierePremiereRepository');

// Toutes les matières de la composition doivent exister
const ensureMaterialsExist = async (composition) => {
  const ids = composition.map((c) => c.matiere);
  const found = await matiereRepository.findByIds(ids);
  if (found.length !== ids.length) {
    throw new AppError('Une ou plusieurs matières premières sont introuvables', 422);
  }
};

const toComposants = (produitId, composition) =>
  composition.map(({ matiere, quantite }) => ({ produit: produitId, matiere, quantite }));

const getById = async (id) => {
  const produit = await produitRepository.findById(id);
  if (!produit) throw new AppError('Produit introuvable', 404);
  const composition = await composantRepository.findByProduit(id);
  return { ...produit.toJSON(), composition };
};

const create = async ({ composition, ...data }) => {
  await ensureMaterialsExist(composition);

  // produit + composition : tout ou rien
  const produit = await runInTransaction(async (session) => {
    const created = await produitRepository.create(data, session);
    await composantRepository.createMany(toComposants(created._id, composition), session);
    return created;
  });
  return getById(produit._id);
};

const list = async ({ page, limit }) => {
  const result = await produitRepository.findPage({ page, limit });
  const composants = await composantRepository.findByProduits(result.items.map((p) => p._id));

  const byProduit = {};
  for (const c of composants) {
    const key = String(c.produit);
    (byProduit[key] = byProduit[key] || []).push({ matiere: c.matiere, quantite: c.quantite });
  }
  result.items = result.items.map((p) => ({ ...p.toJSON(), composition: byProduit[String(p._id)] || [] }));
  return result;
};

// Modifie le produit ; si une composition est fournie, elle REMPLACE l'ancienne.
// Les ordres déjà créés ne changent pas : ils ont leur propre copie.
const update = async (id, { composition, ...data }) => {
  if (composition) await ensureMaterialsExist(composition);

  await runInTransaction(async (session) => {
    const produit = Object.keys(data).length
      ? await produitRepository.updateById(id, data, session)
      : await produitRepository.findById(id);
    if (!produit) throw new AppError('Produit introuvable', 404);

    if (composition) {
      await composantRepository.deleteByProduit(id, session);
      await composantRepository.createMany(toComposants(id, composition), session);
    }
  });
  return getById(id);
};

module.exports = { create, list, getById, update };
