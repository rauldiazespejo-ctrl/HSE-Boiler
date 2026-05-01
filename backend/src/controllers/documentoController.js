const { Op } = require('sequelize');
const { DocumentoHse, Usuario, AuditLog } = require('../models');

const ESTADOS = {
  pendienteLider: 'PENDIENTE_LIDER',
  pendienteJefe: 'PENDIENTE_JEFE',
  aprobado: 'APROBADO',
  rechazado: 'RECHAZADO',
};

const getClientIp = (req) =>
  req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || null;

const getDevice = (req) => req.headers['user-agent'] || 'unknown';

const createAudit = async (req, documento, tipoCambio, accion, extra = {}) => {
  await AuditLog.create({
    tabla_afectada: 'documentos_hse',
    id_registro: documento.id_documento,
    tipo_cambio: tipoCambio,
    usuario_id: req.user.id,
    usuario_rol: req.user.rol,
    cambios_json: {
      accion,
      estado: documento.estado,
      numero_documento: documento.numero_documento,
      ...extra,
    },
    ip_address: getClientIp(req),
    dispositivo: getDevice(req),
    ubicacion_gps: extra.ubicacion_gps || null,
  });
};

const normalizeTipoDocumento = (tipo) => {
  if (!tipo) return null;
  return String(tipo).trim().toUpperCase().replace(/\s+/g, '_');
};

const canApproveAsLider = (rol) => rol === 'lider' || rol === 'gerente';
const canApproveAsJefe = (rol) => rol === 'jefe' || rol === 'gerente';

// Obtener todos los documentos (Para Jefe o Filtro de Líder)
exports.getAllDocumentos = async (req, res) => {
  try {
    const where = {};

    if (req.user.rol === 'lider') {
      where[Op.or] = [
        { creado_por: req.user.id },
        { estado: ESTADOS.pendienteLider },
        { estado: ESTADOS.rechazado },
      ];
    } else if (req.user.rol === 'jefe') {
      // jefe sees pending approvals + all docs for stats
    } else if (req.user.rol === 'gerente') {
      // gerente sees all — no filter
    } else {
      where.creado_por = req.user.id;
    }

    const documentos = await DocumentoHse.findAll({
      where,
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
    const tipoDocumentoNormalizado = normalizeTipoDocumento(tipo_documento);
    if (!tipoDocumentoNormalizado || !contenido_json) {
      return res.status(400).json({
        success: false,
        message: 'tipo_documento y contenido_json son obligatorios',
      });
    }
    
    // Generar un número de documento mock para MVP
    const numero_documento = `${tipoDocumentoNormalizado.substring(0, 3)}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const gpsCreacion = contenido_json?.ubicacionGPS
      ? `${contenido_json.ubicacionGPS.latitud},${contenido_json.ubicacionGPS.longitud}`
      : null;

    const nuevoDocumento = await DocumentoHse.create({
      numero_documento,
      tipo_documento: tipoDocumentoNormalizado,
      sector,
      empresa_id: empresa_id || req.user.empresa_id || 1,
      contenido_json,
      riesgos_json,
      estado: ESTADOS.pendienteLider,
      creado_por: req.user.id,
      firma_digital_creador: contenido_json?.firma || null,
      ubicacion_gps_creacion: gpsCreacion,
      ip_origen_creacion: getClientIp(req),
      dispositivo_creacion: getDevice(req),
    });

    await createAudit(req, nuevoDocumento, 'INSERT', 'CREACION_DOCUMENTO', { ubicacion_gps: gpsCreacion });

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
    const { idDocumento } = req.params;
    const { firma, comentarios } = req.body;

    const documento = await DocumentoHse.findByPk(idDocumento);
    if (!documento) {
      return res.status(404).json({ success: false, message: 'Documento no encontrado' });
    }

    if (documento.estado === ESTADOS.pendienteLider) {
      if (!canApproveAsLider(req.user.rol)) {
        return res.status(403).json({ success: false, message: 'Solo líder puede aprobar esta etapa.' });
      }
      documento.estado = ESTADOS.pendienteJefe;
      documento.comentarios_aprobador = comentarios || null;
      await documento.save();
      await createAudit(req, documento, 'UPDATE', 'APROBACION_ETAPA_LIDER', {
        comentarios: comentarios || null,
      });
      return res.json({
        success: true,
        message: 'Documento aprobado por Líder y enviado a Jefe',
        data: documento,
      });
    }

    if (documento.estado !== ESTADOS.pendienteJefe) {
      return res.status(409).json({
        success: false,
        message: `No se puede aprobar un documento en estado ${documento.estado}`,
      });
    }

    if (!canApproveAsJefe(req.user.rol)) {
      return res.status(403).json({ success: false, message: 'Solo jefe puede aprobar esta etapa.' });
    }

    documento.estado = ESTADOS.aprobado;
    documento.aprobado_por = req.user.id;
    documento.fecha_aprobacion = new Date();
    documento.firma_digital_aprobador = firma || null;
    documento.comentarios_aprobador = comentarios || null;
    documento.ip_origen_aprobacion = getClientIp(req);
    documento.dispositivo_aprobacion = getDevice(req);
    await documento.save();
    await createAudit(req, documento, 'UPDATE', 'APROBACION_FINAL_JEFE', {
      comentarios: comentarios || null,
    });

    res.json({ success: true, message: 'Documento aprobado', data: documento });
  } catch (error) {
    console.error('Error approving documento:', error);
    res.status(500).json({ success: false, message: 'Error interno' });
  }
};

// Rechazar documento
exports.rechazarDocumento = async (req, res) => {
  try {
    const { idDocumento } = req.params;
    const { comentarios } = req.body;

    const documento = await DocumentoHse.findByPk(idDocumento);
    if (!documento) {
      return res.status(404).json({ success: false, message: 'Documento no encontrado' });
    }

    if (!canApproveAsLider(req.user.rol) && !canApproveAsJefe(req.user.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para rechazar este documento.',
      });
    }

    documento.estado = ESTADOS.rechazado;
    documento.aprobado_por = req.user.id;
    documento.motivo_rechazo = comentarios || 'Sin detalle';
    documento.comentarios_aprobador = comentarios || null;
    documento.fecha_aprobacion = new Date();
    documento.ip_origen_aprobacion = getClientIp(req);
    documento.dispositivo_aprobacion = getDevice(req);
    await documento.save();
    await createAudit(req, documento, 'UPDATE', 'RECHAZO_DOCUMENTO', {
      comentarios: comentarios || null,
    });

    res.json({ success: true, message: 'Documento rechazado', data: documento });
  } catch (error) {
    console.error('Error rejecting documento:', error);
    res.status(500).json({ success: false, message: 'Error interno' });
  }
};

exports.getDocumentoById = async (req, res) => {
  try {
    const { idDocumento } = req.params;
    const documento = await DocumentoHse.findByPk(idDocumento, {
      include: [
        { model: Usuario, as: 'creador', attributes: ['id_usuario', 'nombre', 'rol'] },
        { model: Usuario, as: 'aprobador', attributes: ['id_usuario', 'nombre', 'rol', 'certificaciones_json'] }
      ],
    });
    if (!documento) {
      return res.status(404).json({ success: false, message: 'Documento no encontrado' });
    }
    return res.json({ success: true, data: documento });
  } catch (error) {
    console.error('Error fetching documento by id:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

exports.getDocumentoHistory = async (req, res) => {
  try {
    const { idDocumento } = req.params;
    const history = await AuditLog.findAll({
      where: {
        tabla_afectada: 'documentos_hse',
        id_registro: idDocumento,
      },
      include: [{ model: Usuario, as: 'usuario', attributes: ['id_usuario', 'nombre', 'rol'] }],
      order: [['timestamp', 'DESC']],
    });
    return res.json({ success: true, data: history });
  } catch (error) {
    console.error('Error fetching documento history:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

