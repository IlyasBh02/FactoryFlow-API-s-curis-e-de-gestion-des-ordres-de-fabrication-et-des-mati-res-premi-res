jest.mock('../src/repositories/stockRepository', () => ({
  addEntry: jest.fn(),
  listMovements: jest.fn(),
}));

const stockRepository = require('../src/repositories/stockRepository');
const stockService = require('../src/services/stockService');

describe('stockService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('records a stock entry for the requested material and user', async () => {
    const stock = { matiere: 'material-1', quantite: 10 };
    stockRepository.addEntry.mockResolvedValue(stock);

    await expect(
      stockService.addEntry({ matiere: 'material-1', quantite: 10 }, 'user-1')
    ).resolves.toBe(stock);
    expect(stockRepository.addEntry).toHaveBeenCalledWith(
      'material-1',
      10,
      'user-1'
    );
  });

  it('returns 404 when the material for a stock entry does not exist', async () => {
    stockRepository.addEntry.mockResolvedValue(null);

    await expect(
      stockService.addEntry({ matiere: 'missing', quantite: 10 }, 'user-1')
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it('passes movement filters through to the repository', async () => {
    const query = { page: 2, limit: 5, type: 'ENTRY' };
    const movements = [{ quantite: 10 }];
    stockRepository.listMovements.mockResolvedValue(movements);

    await expect(stockService.listMovements(query)).resolves.toBe(movements);
    expect(stockRepository.listMovements).toHaveBeenCalledWith(query);
  });
});
