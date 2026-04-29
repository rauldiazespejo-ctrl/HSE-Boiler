const { DocumentoHse, Usuario } = require('../models');

// Obtener todos los documentos (Para Jefe o Filtro de Líder)
exports.getAllDocumentos = async (req, res) => {
  try {
    const documentos = await DocumentoHse.findAll({
      include: [
        { model: Usuario, as: 'creador', attributes: ['id_usuario', 'nombre', 'rol'] },
        { model: Usuario, as: 'aprobador', attributes: ['id_usuario', 'nombre', 'rol'] }
      ],
      order: [['fecha_creacion', 'DESC']]
    });

    res.json({ success: true, data: documentos });
  } catch (error) {
    console.error('Error fetching documentos:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// Crear nuevo documento (HOT WORK, AST, etc.)
exports.createDocumento = async (req, res) => {
  try {
    const { tipo_documento, sector, empresa_id, contenido_json, riesgos_json } = req.body;
    
    // Generar un número de documento mock para MVP
    const numero_documento = `${tipo_documento.substring(0, 3)}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const nuevoDocumento = await DocumentoHse.create({
      numero_documento,
      tipo_documento,
      sector,
      empresa_id: empresa_id || 1, // Default para MVP
      contenido_json,
      riesgos_json,
      estado: 'PENDIENTE',
      creado_por: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Documento creado exitosamente',
      data: nuevoDocumento
    });
  } catch (error) {
    console.error('Error creating documento:', error);
    res.status(500).json({ success: false, message: 'Error al crear documento', error: error.message });
  }
};

// Aprobar documento
exports.aprobarDocumento = async (req, res) => {
  try {
    const { id } = req.params;
    const { firma, comentarios } = req.body;

    const documento = await DocumentoHse.findOne({ where: { numero_documento: id } });
    if (!documento) {
      return res.status(404).json({ success: false, message: 'Documento no encontrado' });
    }

    documento.estado = 'APROBADO';
    documento.aprobado_por = req.user.id;
    // Podríamos guardar firma y comentarios en un modelo Anexo o AuditLog
    await documento.save();

    res.json({ success: true, message: 'Documento aprobado', data: documento });
  } catch (error) {
    console.error('Error approving documento:', error);
    res.status(500).json({ success: false, message: 'Error interno' });
  }
};

// Rechazar documento
exports.rechazarDocumento = async (req, res) => {
  try {
    const { id } = req.params;
    const { comentarios } = req.body;

    const documento = await DocumentoHse.findOne({ where: { numero_documento: id } });
    if (!documento) {
      return res.status(404).json({ success: false, message: 'Documento no encontrado' });
    }

    documento.estado = 'RECHAZADO';
    documento.aprobado_por = req.user.id;
    await documento.save();

    res.json({ success: true, message: 'Documento rechazado', data: documento });
  } catch (error) {
    console.error('Error rejecting documento:', error);
    res.status(500).json({ success: false, message: 'Error interno' });
  }
};

