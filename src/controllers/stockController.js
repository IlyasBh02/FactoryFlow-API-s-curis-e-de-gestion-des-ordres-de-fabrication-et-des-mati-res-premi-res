const stockService = require('../services/stockService');
const asyncHandler = require('../utils/asyncHandler');
const { success, paginated } = require('../utils/response');

const addEntry = asyncHandler(async (req, res) => {
  success(res, await stockService.addEntry(req.body, req.user.id), 201);
});

const listMovements = asyncHandler(async (req, res) => {
  paginated(res, await stockService.listMovements(req.validatedQuery));
});

module.exports = { addEntry, listMovements };
