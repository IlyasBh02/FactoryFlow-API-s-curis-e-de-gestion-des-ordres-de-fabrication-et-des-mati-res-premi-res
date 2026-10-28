const router = require('express').Router();
const controller = require('../controllers/authController');
const authenticate = require('../middlewares/authenticate');
const validate = require('../middlewares/validate');
const { loginSchema } = require('../validators/authValidator');

router.post('/login', validate(loginSchema), controller.login);
router.get('/me', authenticate, controller.me);

module.exports = router;
