const router = require('express').Router();
const controller = require('../controllers/userController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { ROLES } = require('../utils/constants');
const { createOperatorSchema } = require('../validators/userValidator');

router.post(
  '/operators',
  authenticate,
  authorize(ROLES.ADMIN),
  validate(createOperatorSchema),
  controller.createOperator
);

module.exports = router;
