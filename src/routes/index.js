const router = require('express').Router();

router.get('/health', (req, res) => res.json({ status: 'ok' }));
router.use('/installation', require('./installationRoutes'));
router.use('/auth', require('./authRoutes'));
router.use('/users', require('./userRoutes'));
router.use('/raw-materials', require('./matierePremiereRoutes'));
router.use('/stock', require('./stockRoutes'));
router.use('/products', require('./produitRoutes'));

module.exports = router;
