const router = require('express').Router();
const controller = require('../controllers/matierePremiereController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { ROLES } = require('../utils/constants');
const { createSchema, updateSchema } = require('../validators/matierePremiereValidator');

// Toutes les routes de ce module sont réservées à l'Admin
router.use(authenticate, authorize(ROLES.ADMIN));

// /alerts avant /:id, sinon "alerts" serait lu comme un identifiant
router.get('/alerts', controller.getAlerts);
router.post('/', validate(createSchema), controller.create);
router.get('/', controller.list);
router.get('/:id', controller.getById);
router.put('/:id', validate(updateSchema), controller.update);

module.exports = router;
