const router = require('express').Router();
const controller = require('../controllers/produitController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { ROLES } = require('../utils/constants');
const { createSchema, updateSchema, listQuerySchema } = require('../validators/produitValidator');

// Toutes les routes de ce module sont réservées à l'Admin
router.use(authenticate, authorize(ROLES.ADMIN));

router.post('/', validate(createSchema), controller.create);
router.get('/', validate(listQuerySchema, 'query'), controller.list);
router.get('/:id', controller.getById);
router.put('/:id', validate(updateSchema), controller.update);

module.exports = router;
