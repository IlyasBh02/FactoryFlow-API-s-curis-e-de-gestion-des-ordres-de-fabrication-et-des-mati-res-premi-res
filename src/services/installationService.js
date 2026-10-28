const bcrypt = require('bcryptjs');
const AppError = require('../utils/AppError');
const { ROLES } = require('../utils/constants');
const { runInTransaction } = require('../utils/transaction');
const installationRepository = require('../repositories/installationRepository');
const userRepository = require('../repositories/userRepository');

const getStatus = async () => {
  const state = await installationRepository.find();
  return Boolean(state && state.installed);
};

const install = async ({ name, email, password }) => {
  // refus rapide, avant tout travail inutile
  if (await getStatus()) {
    throw new AppError("L'application est déjà installée", 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  return runInTransaction(async (session) => {
    // revérification à l'intérieur de la transaction
    if (await installationRepository.find(session)) {
      throw new AppError("L'application est déjà installée", 409);
    }
    const admin = await userRepository.create(
      { name, email, passwordHash, role: ROLES.ADMIN },
      session
    );
    await installationRepository.create(
      { installed: true, installedAt: new Date(), admin: admin._id },
      session
    );
    return admin;
  });
};

module.exports = { getStatus, install };