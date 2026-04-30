require('dotenv').config();
const { sequelize } = require('./src/models');

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ PostgreSQL conectado.');

    await sequelize.sync({ alter: true });
    console.log('✓ Schema sincronizado.');

    const bcrypt = require('bcryptjs');
    const { Usuario } = require('./src/models');

    const usuarios = [
      {
        email: 'operario@forjasafe.cl',
        password: 'forja2024',
        nombre: 'Carlos Muñoz',
        rol: 'lider',
      },
      {
        email: 'jefe@forjasafe.cl',
        password: 'forja2024',
        nombre: 'Roberto Vega',
        rol: 'jefe',
      },
      {
        email: 'gerente@forjasafe.cl',
        password: 'forja2024',
        nombre: 'Alejandro Ríos',
        rol: 'gerente',
      },
    ];

    for (const u of usuarios) {
      const existing = await Usuario.findOne({ where: { email: u.email } });
      if (existing) {
        console.log(`  · ${u.email} ya existe — omitido.`);
        continue;
      }
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(u.password, salt);
      await Usuario.create({
        email: u.email,
        password_hash,
        nombre: u.nombre,
        rol: u.rol,
        activo: true,
        empresa_id: 1,
      });
      console.log(`  ✓ Creado: ${u.email} (${u.rol})`);
    }

    console.log('\n✅ Seed completado. Credenciales:');
    console.log('   operario@forjasafe.cl  / forja2024');
    console.log('   jefe@forjasafe.cl      / forja2024');
    console.log('   gerente@forjasafe.cl   / forja2024');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error en seed:', error.message);
    process.exit(1);
  }
};

seed();
