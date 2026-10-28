jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
}));

jest.mock('../src/utils/transaction', () => ({
  runInTransaction: jest.fn(async (callback) => callback('session')),
}));

jest.mock('../src/repositories/installationRepository', () => ({
  find: jest.fn(),
  create: jest.fn(),
}));

jest.mock('../src/repositories/userRepository', () => ({
  create: jest.fn(),
}));

const bcrypt = require('bcryptjs');
const installationRepository = require('../src/repositories/installationRepository');
const userRepository = require('../src/repositories/userRepository');
const installationService = require('../src/services/installationService');
const { ROLES } = require('../src/utils/constants');

describe('installationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('reports whether the application has been installed', async () => {
    installationRepository.find.mockResolvedValueOnce({ installed: true });
    await expect(installationService.getStatus()).resolves.toBe(true);

    installationRepository.find.mockResolvedValueOnce(null);
    await expect(installationService.getStatus()).resolves.toBe(false);
  });

  it('creates the initial admin and installation state in one transaction', async () => {
    const admin = { _id: 'admin-1' };
    installationRepository.find.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('hashed-password');
    userRepository.create.mockResolvedValue(admin);

    await expect(
      installationService.install({
        name: 'Admin',
        email: 'admin@example.com',
        password: 'strong-password',
      })
    ).resolves.toBe(admin);

    expect(installationRepository.find).toHaveBeenNthCalledWith(2, 'session');
    expect(userRepository.create).toHaveBeenCalledWith(
      {
        name: 'Admin',
        email: 'admin@example.com',
        passwordHash: 'hashed-password',
        role: ROLES.ADMIN,
      },
      'session'
    );
    expect(installationRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ installed: true, admin: admin._id }),
      'session'
    );
  });

  it('rejects a second installation before hashing the password', async () => {
    installationRepository.find.mockResolvedValue({ installed: true });

    await expect(
      installationService.install({
        name: 'Admin',
        email: 'admin@example.com',
        password: 'strong-password',
      })
    ).rejects.toMatchObject({ statusCode: 409 });

    expect(bcrypt.hash).not.toHaveBeenCalled();
    expect(userRepository.create).not.toHaveBeenCalled();
  });

  it('rejects an installation when another request wins the transaction race', async () => {
    installationRepository.find
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ installed: true });
    bcrypt.hash.mockResolvedValue('hashed-password');

    await expect(
      installationService.install({
        name: 'Admin',
        email: 'admin@example.com',
        password: 'strong-password',
      })
    ).rejects.toMatchObject({ statusCode: 409 });

    expect(userRepository.create).not.toHaveBeenCalled();
    expect(installationRepository.create).not.toHaveBeenCalled();
  });
});
