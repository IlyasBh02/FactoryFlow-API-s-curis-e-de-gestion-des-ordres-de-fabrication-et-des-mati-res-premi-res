const User = require('../models/User');

const create = (data, session) =>
  User.create([data], { session }).then(([user]) => user);

const findByEmail = (email) => User.findOne({ email }).select('+passwordHash');

const findById = (id) => User.findById(id);

module.exports = { create, findByEmail, findById };