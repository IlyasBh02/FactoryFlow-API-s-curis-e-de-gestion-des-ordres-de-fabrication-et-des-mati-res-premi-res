const userService = require('../services/userService');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');

const createOperator = asyncHandler(async (req, res) => {
  const operator = await userService.createOperator(req.body);
  success(res, operator, 201);
});

module.exports = { createOperator };