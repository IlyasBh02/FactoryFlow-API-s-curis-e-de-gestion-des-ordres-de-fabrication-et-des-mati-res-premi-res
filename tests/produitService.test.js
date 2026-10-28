jest.mock('../src/utils/transaction', () => ({
  runInTransaction: jest.fn(async (callback) => callback('session')),
}));

jest.mock('../src/repositories/produitRepository', () => ({
  create: jest.fn(),
  findById: jest.fn(),
  findPage: jest.fn(),
}));

jest.mock('../src/repositories/composantRepository', () => ({
  createMany: jest.fn(),
  findByProduit: jest.fn(),
  findByProduits: jest.fn(),
}));

jest.mock('../src/repositories/matierePremiereRepository', () => ({
  findByIds: jest.fn(),
}));

const produitRepository = require('../src/repositories/produitRepository');
const composantRepository = require('../src/repositories/composantRepository');
const matiereRepository = require('../src/repositories/matierePremiereRepository');
const produitService = require('../src/services/produitService');
const { runInTransaction } = require('../src/utils/transaction');

describe('produitService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a product with its material composition in one transaction', async () => {
    const composition = [{ matiere: 'material-1', quantite: 2 }];
    const productDocument = {
      _id: 'product-1',
      toJSON: () => ({ _id: 'product-1', nom: 'Product' }),
    };
    matiereRepository.findByIds.mockResolvedValue([{ _id: 'material-1' }]);
    produitRepository.create.mockResolvedValue({ _id: 'product-1' });
    produitRepository.findById.mockResolvedValue(productDocument);
    composantRepository.findByProduit.mockResolvedValue(composition);

    const result = await produitService.create({
      nom: 'Product',
      reference: 'P-1',
      composition,
    });

    expect(result).toEqual({
      _id: 'product-1',
      nom: 'Product',
      composition,
    });
    expect(produitRepository.create).toHaveBeenCalledWith(
      { nom: 'Product', reference: 'P-1' },
      'session'
    );
    expect(composantRepository.createMany).toHaveBeenCalledWith(
      [{ produit: 'product-1', matiere: 'material-1', quantite: 2 }],
      'session'
    );
    expect(runInTransaction).toHaveBeenCalledTimes(1);
  });

  it('rejects a composition containing an unknown material', async () => {
    matiereRepository.findByIds.mockResolvedValue([]);

    await expect(
      produitService.create({
        nom: 'Product',
        composition: [{ matiere: 'missing-material', quantite: 1 }],
      })
    ).rejects.toMatchObject({ statusCode: 422 });

    expect(runInTransaction).not.toHaveBeenCalled();
    expect(produitRepository.create).not.toHaveBeenCalled();
  });

  it('groups compositions by product when listing products', async () => {
    const first = { _id: 'product-1', toJSON: () => ({ _id: 'product-1' }) };
    const second = { _id: 'product-2', toJSON: () => ({ _id: 'product-2' }) };
    const firstMaterial = { matiere: 'material-1', quantite: 2 };
    produitRepository.findPage.mockResolvedValue({
      items: [first, second],
      total: 2,
    });
    composantRepository.findByProduits.mockResolvedValue([
      { produit: 'product-1', ...firstMaterial },
    ]);

    await expect(produitService.list({ page: 1, limit: 10 })).resolves.toEqual({
      items: [
        { _id: 'product-1', composition: [firstMaterial] },
        { _id: 'product-2', composition: [] },
      ],
      total: 2,
    });
  });

  it('returns 404 when retrieving an unknown product', async () => {
    produitRepository.findById.mockResolvedValue(null);

    await expect(produitService.getById('missing')).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});
