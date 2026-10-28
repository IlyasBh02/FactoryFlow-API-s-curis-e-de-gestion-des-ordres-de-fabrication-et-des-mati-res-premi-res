const bcrypt = require('bcryptjs');
const AppError = require('../utils/AppError');
const { ROLES } = require('../utils/constants');
const userRepository = require('../repositories/userRepository');

const createOperator = async ({ name, email, password }) => {
  if (await userRepository.findByEmail(email)) {
    throw new AppError('Un compte avec cet email existe déjà', 409);
  }
  const passwordHash = await bcrypt.hash(password, 10);
  
  return userRepository.create({ name, email, passwordHash, role: ROLES.OPERATEUR });
};

module.exports = { createOperator };
