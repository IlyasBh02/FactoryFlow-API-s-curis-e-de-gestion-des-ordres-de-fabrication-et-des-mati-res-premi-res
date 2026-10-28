const produitService = require('../services/produitService');
const asyncHandler = require('../utils/asyncHandler');
const { success, paginated } = require('../utils/response');

const create = asyncHandler(async (req, res) => {
  success(res, await produitService.create(req.body), 201);
});

const list = asyncHandler(async (req, res) => {
  paginated(res, await produitService.list(req.validatedQuery));
});

const getById = asyncHandler(async (req, res) => {
  success(res, await produitService.getById(req.params.id));
});

const update = asyncHandler(async (req, res) => {
  success(res, await produitService.update(req.params.id, req.body));
});

module.exports = { create, list, getById, update };
