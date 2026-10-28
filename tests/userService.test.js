jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
}));

jest.mock('../src/repositories/userRepository', () => ({
  findByEmail: jest.fn(),
  create: jest.fn(),
}));

const bcrypt = require('bcryptjs');
const userRepository = require('../src/repositories/userRepository');
const userService = require('../src/services/userService');
const { ROLES } = require('../src/utils/constants');

describe('userService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates an operator with a hashed password and operator role', async () => {
    const operator = { id: 'operator-1' };
    userRepository.findByEmail.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('hashed-password');
    userRepository.create.mockResolvedValue(operator);

    await expect(
      userService.createOperator({
        name: 'Operator',
        email: 'operator@example.com',
        password: 'strong-password',
      })
    ).resolves.toBe(operator);

    expect(bcrypt.hash).toHaveBeenCalledWith('strong-password', 10);
    expect(userRepository.create).toHaveBeenCalledWith({
      name: 'Operator',
      email: 'operator@example.com',
      passwordHash: 'hashed-password',
      role: ROLES.OPERATEUR,
    });
  });

  it('rejects duplicate email addresses without creating an account', async () => {
    userRepository.findByEmail.mockResolvedValue({ id: 'existing-user' });

    await expect(
      userService.createOperator({
        name: 'Operator',
        email: 'existing@example.com',
        password: 'strong-password',
      })
    ).rejects.toMatchObject({ statusCode: 409 });

    expect(bcrypt.hash).not.toHaveBeenCalled();
    expect(userRepository.create).not.toHaveBeenCalled();
  });
});
