jest.mock('../src/utils/transaction', () => ({
  runInTransaction: jest.fn(async (callback) => callback('session')),
}));

jest.mock('../src/repositories/matierePremiereRepository', () => ({
  create: jest.fn(),
  findById: jest.fn(),
}));

jest.mock('../src/repositories/stockRepository', () => ({
  create: jest.fn(),
}));

const matiereRepository = require('../src/repositories/matierePremiereRepository');
const stockRepository = require('../src/repositories/stockRepository');
const matiereService = require('../src/services/matierePremiereService');
const { MOVEMENT_TYPE } = require('../src/utils/constants');

describe('matierePremiereService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates initial stock and records its entry movement in one transaction', async () => {
    const material = { _id: 'material-1' };
    const savedMaterial = { _id: 'material-1', reference: 'RM-1' };
    matiereRepository.create.mockResolvedValue(material);
    matiereRepository.findById.mockResolvedValue(savedMaterial);

    await expect(
      matiereService.create(
        { reference: 'RM-1', name: 'Steel', stockInitial: 25 },
        'admin-1'
      )
    ).resolves.toBe(savedMaterial);

    expect(matiereRepository.create).toHaveBeenCalledWith(
      { reference: 'RM-1', name: 'Steel' },
      'session'
    );
    expect(stockRepository.create).toHaveBeenCalledWith(
      {
        matiere: material._id,
        quantite: 25,
        mouvements: [
          {
            type: MOVEMENT_TYPE.ENTRY,
            quantite: 25,
            user: 'admin-1',
          },
        ],
      },
      'session'
    );
  });

  it('creates zero initial stock without an entry movement by default', async () => {
    matiereRepository.create.mockResolvedValue({ _id: 'material-2' });
    matiereRepository.findById.mockResolvedValue({ _id: 'material-2' });

    await matiereService.create({ reference: 'RM-2', name: 'Copper' }, 'admin-1');

    expect(stockRepository.create).toHaveBeenCalledWith(
      { matiere: 'material-2', quantite: 0, mouvements: [] },
      'session'
    );
  });
});
