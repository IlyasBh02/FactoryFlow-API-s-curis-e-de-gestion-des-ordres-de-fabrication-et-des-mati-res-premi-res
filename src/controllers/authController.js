const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body); 
  success(res, result);
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user.id);
  success(res, user);
});

module.exports = { login, me };