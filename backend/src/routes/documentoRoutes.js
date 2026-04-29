const express = require('express');
const router = express.Router();
const documentoController = require('../controllers/documentoController');
const authMiddleware = require('../middlewares/authMiddleware');

// All documento routes should be protected
router.use(authMiddleware);

router.get('/', documentoController.getAllDocumentos);
router.post('/', documentoController.createDocumento);
router.post('/:id/aprobar', documentoController.aprobarDocumento);
router.post('/:id/rechazar', documentoController.rechazarDocumento);

module.exports = router;
