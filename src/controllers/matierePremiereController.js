const matiereService = require('../services/matierePremiereService');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');

const create = asyncHandler(async (req, res) => {
  success(res, await matiereService.create(req.body, req.user.id), 201);
});

const list = asyncHandler(async (req, res) => {
  success(res, await matiereService.list());
});

const getById = asyncHandler(async (req, res) => {
  success(res, await matiereService.getById(req.params.id));
});

const update = asyncHandler(async (req, res) => {
  success(res, await matiereService.update(req.params.id, req.body));
});

const getAlerts = asyncHandler(async (req, res) => {
  success(res, await matiereService.getBelowThreshold());
});

module.exports = { create, list, getById, update, getAlerts };
