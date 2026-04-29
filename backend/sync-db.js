require('dotenv').config();
const { sequelize } = require('./src/models');

const syncDb = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL connection successful.');
    
    // Sync models to database
    await sequelize.sync({ alter: true });
    console.log('Database schema synchronized successfully.');
    
    // Create a mock user if not exists
    const bcrypt = require('bcryptjs');
    const { Usuario } = require('./src/models');
    
    const count = await Usuario.count();
    if (count === 0) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('admin123', salt);
      await Usuario.create({
        email: 'juan.perez@hse.cl',
        password_hash: hash,
        nombre: 'Juan Pérez',
        rol: 'líder',
        activo: true
      });
      console.log('Mock user juan.perez@hse.cl created.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error synchronizing database schema:', error);
    process.exit(1);
  }
};

syncDb();
