const express = require('express');
const router = express.Router();
const documentoController = require('../controllers/documentoController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// All documento routes should be protected
router.use(authMiddleware);

router.get('/', documentoController.getAllDocumentos);
router.post('/', documentoController.createDocumento);
router.get('/:idDocumento', documentoController.getDocumentoById);
router.get('/:idDocumento/historial', documentoController.getDocumentoHistory);
router.post('/:idDocumento/aprobar', documentoController.aprobarDocumento);
router.post('/:idDocumento/rechazar', documentoController.rechazarDocumento);

module.exports = router;
