const { sequelize } = require('../config/database');
const Usuario = require('./Usuario');
const DocumentoHse = require('./DocumentoHse');
const Anexo = require('./Anexo');

// Ensure relationships are initialized
const models = {
  Usuario,
  DocumentoHse,
  Anexo
};

module.exports = {
  sequelize,
  ...models
};
