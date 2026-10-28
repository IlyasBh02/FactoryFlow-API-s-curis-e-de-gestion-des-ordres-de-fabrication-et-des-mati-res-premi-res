const installationService = require('../services/installationService');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');

const getStatus = asyncHandler(async (req, res) => {
  const installed = await installationService.getStatus();
  success(res, { installed });
});

const install = asyncHandler(async (req, res) => {
  const admin = await installationService.install(req.body);
  success(res, admin, 201);
});

module.exports = { getStatus, install };