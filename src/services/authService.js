const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const { jwtSecret, jwtExpiresIn } = require('../config/env');
const userRepository = require('../repositories/userRepository');

const login = async ({ email, password }) => {
  const user = await userRepository.findByEmail(email);
  const valid = user && (await bcrypt.compare(password, user.passwordHash));

  if (!valid) throw new AppError('Email ou mot de passe incorrect', 401);

  const token = jwt.sign({ sub: user.id, role: user.role }, jwtSecret, {
    expiresIn: jwtExpiresIn,
  });
  return { token, user };
};

const getProfile = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) throw new AppError('Utilisateur introuvable', 404);
  return user;
};

module.exports = { login, getProfile };