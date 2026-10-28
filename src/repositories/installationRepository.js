const InstallationState = require('../models/InstallationState');

const find = (session) =>
  InstallationState.findOne({ key: 'installation' }).session(session || null);

const create = (data, session) =>
  InstallationState.create([data], { session }).then(([state]) => state);

module.exports = { find, create };