const router = require('express').Router();
const controller = require('../controllers/stockController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { ROLES } = require('../utils/constants');
const { entrySchema, movementsQuerySchema } = require('../validators/stockValidator');

// Toutes les routes de ce module sont réservées à l'Admin
router.use(authenticate, authorize(ROLES.ADMIN));

router.post('/entries', validate(entrySchema), controller.addEntry);
router.get('/movements', validate(movementsQuerySchema, 'query'), controller.listMovements);

module.exports = router;
