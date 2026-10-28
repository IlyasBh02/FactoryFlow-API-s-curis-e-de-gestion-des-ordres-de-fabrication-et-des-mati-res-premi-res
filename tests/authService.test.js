process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/factoryflow-test';
process.env.JWT_SECRET = 'factoryflow-test-secret';
process.env.JWT_EXPIRES_IN = '1h';

jest.mock('../src/repositories/userRepository', () => ({
  findByEmail: jest.fn(),
  findById: jest.fn(),
}));

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../src/repositories/userRepository');
const authService = require('../src/services/authService');

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns a signed token and user when credentials are valid', async () => {
    const user = {
      id: 'user-1',
      role: 'ADMIN',
      passwordHash: await bcrypt.hash('correct-password', 4),
    };
    userRepository.findByEmail.mockResolvedValue(user);

    const result = await authService.login({
      email: 'admin@example.com',
      password: 'correct-password',
    });

    expect(result.user).toBe(user);
    expect(jwt.verify(result.token, process.env.JWT_SECRET)).toMatchObject({
      sub: 'user-1',
      role: 'ADMIN',
    });
  });

  it.each([
    ['unknown email', null, 'correct-password'],
    ['wrong password', { passwordHash: 'invalid-hash' }, 'wrong-password'],
  ])('rejects login for %s', async (_case, user, password) => {
    userRepository.findByEmail.mockResolvedValue(user);

    await expect(
      authService.login({ email: 'admin@example.com', password })
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it('returns the profile for an existing user', async () => {
    const user = { id: 'user-1', name: 'Admin' };
    userRepository.findById.mockResolvedValue(user);

    await expect(authService.getProfile('user-1')).resolves.toBe(user);
  });

  it('returns 404 when the profile does not exist', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(authService.getProfile('missing')).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});
