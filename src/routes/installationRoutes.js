const router = require('express').Router();
const controller = require('../controllers/installationController');
const validate = require('../middlewares/validate');
const { installSchema } = require('../validators/installationValidator');

router.get('/status', controller.getStatus);
router.post('/', validate(installSchema), controller.install);

module.exports = router;