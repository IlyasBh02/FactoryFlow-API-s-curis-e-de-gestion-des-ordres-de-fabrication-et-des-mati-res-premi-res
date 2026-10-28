process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/factoryflow-test';
process.env.JWT_SECRET = 'factoryflow-test-secret';

jest.mock('dotenv', () => ({ config: jest.fn() }));

const app = require('../src/app');

describe('GET /api/health', () => {
  it('returns an ok status without connecting to MongoDB', async () => {
    const server = app.listen(0);
    await new Promise((resolve) => server.once('listening', resolve));

    try {
      const response = await fetch(
        `http://127.0.0.1:${server.address().port}/api/health`
      );

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toEqual({ status: 'ok' });
    } finally {
      await new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }
  });
});
