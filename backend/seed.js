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

    const DEFAULT_PASSWORD = 'forja2024';

    const usuarios = [
      {
        email: 'raul.diaz@forjasafe.cl',
        password: DEFAULT_PASSWORD,
        nombre: 'Raúl Díaz',
        rol: 'gerente',
        cargo: 'Gerente de HSEC',
        rut: null,
      },
      {
        email: 'ruben.arbelo@forjasafe.cl',
        password: DEFAULT_PASSWORD,
        nombre: 'Rubén Arbelo',
        rol: 'gerente',
        cargo: 'Gerente de Operaciones',
        rut: null,
      },

      {
        email: 'cristian.arancibia@forjasafe.cl',
        password: DEFAULT_PASSWORD,
        nombre: 'Cristian Gilberto Arancibia Estay',
        rol: 'jefe',
        cargo: 'Ingeniero de Diseño',
        rut: '19.048.732-6',
      },
      {
        email: 'leslye.cabrera@forjasafe.cl',
        password: DEFAULT_PASSWORD,
        nombre: 'Leslye Maria Cabrera Meza',
        rol: 'jefe',
        cargo: 'Ingeniero de Proyectos',
        rut: '18.018.113-k',
      },
      {
        email: 'edgardo.garcia@forjasafe.cl',
        password: DEFAULT_PASSWORD,
        nombre: 'Edgardo Orlando Garcia Olmos',
        rol: 'jefe',
        cargo: 'Administrador de Maestranza',
        rut: '16.756.472-0',
      },
      {
        email: 'alexis.olivares@forjasafe.cl',
        password: DEFAULT_PASSWORD,
        nombre: 'Alexis Lelis Olivares Machuca',
        rol: 'jefe',
        cargo: 'Jefe Oficina Técnica',
        rut: '12.820.370-2',
      },
      {
        email: 'jorge.vilches@forjasafe.cl',
        password: DEFAULT_PASSWORD,
        nombre: 'Jorge Vilches Vergara',
        rol: 'jefe',
        cargo: 'Especialista Líder',
        rut: '18.421.336-2',
      },

      {
        email: 'ivan.cabrera@forjasafe.cl',
        password: DEFAULT_PASSWORD,
        nombre: 'Ivan Felipe Cabrera Pulgar',
        rol: 'lider',
        cargo: 'Especialista 2',
        rut: '20.710.238-5',
      },
      {
        email: 'cristian.collao@forjasafe.cl',
        password: DEFAULT_PASSWORD,
        nombre: 'Cristian Fabian Collao Saavedra',
        rol: 'lider',
        cargo: 'Especialista Líder',
        rut: '14.610.322-7',
      },
      {
        email: 'ismael.rozas@forjasafe.cl',
        password: DEFAULT_PASSWORD,
        nombre: 'Ismael Rozas Bravo',
        rol: 'lider',
        cargo: 'Especialista 1',
        rut: '19.447.189-0',
      },
      {
        email: 'pablo.gonzalez@forjasafe.cl',
        password: DEFAULT_PASSWORD,
        nombre: 'Pablo Gonzalez Bascuñan',
        rol: 'lider',
        cargo: 'Soldador',
        rut: '16.756.357-0',
      },
      {
        email: 'brandon.guzman@forjasafe.cl',
        password: DEFAULT_PASSWORD,
        nombre: 'Brandon Elías Guzman Delgado',
        rol: 'lider',
        cargo: 'Maestro Primera',
        rut: '18.854.216-6',
      },
      {
        email: 'marco.guzman@forjasafe.cl',
        password: DEFAULT_PASSWORD,
        nombre: 'Marco Guzman Delgado',
        rol: 'lider',
        cargo: 'Maestro Mayor',
        rut: '15.851.279-3',
      },
      {
        email: 'daniel.ramirez@forjasafe.cl',
        password: DEFAULT_PASSWORD,
        nombre: 'Daniel Ramirez Rodriguez',
        rol: 'lider',
        cargo: 'Soldador',
        rut: '19.447.274-9',
      },
      {
        email: 'jonathan.saavedra@forjasafe.cl',
        password: DEFAULT_PASSWORD,
        nombre: 'Jonathan Andres Saavedra Guzman',
        rol: 'lider',
        cargo: 'Maestro Primera Estructura',
        rut: '21.404.149-9',
      },
      {
        email: 'carlos.veliz@forjasafe.cl',
        password: DEFAULT_PASSWORD,
        nombre: 'Carlos Veliz Saldivar',
        rol: 'lider',
        cargo: 'Maestro Mayor',
        rut: '18.511.549-6',
      },
      {
        email: 'dylan.forton@forjasafe.cl',
        password: DEFAULT_PASSWORD,
        nombre: 'Dylan Emerson Forton Donoso',
        rol: 'lider',
        cargo: 'Maestro Mayor Control e Instrumentación',
        rut: '19.393.794-2',
      },
      {
        email: 'miguel.castro@forjasafe.cl',
        password: DEFAULT_PASSWORD,
        nombre: 'Miguel Angel Castro Gonzales',
        rol: 'lider',
        cargo: 'Maestro Mayor Pintor Granallado',
        rut: '22.923.996-1',
      },
      {
        email: 'diego.contreras@forjasafe.cl',
        password: DEFAULT_PASSWORD,
        nombre: 'Diego Jhoan Contreras Aguilar',
        rol: 'lider',
        cargo: 'Ayudante',
        rut: '26.766.842-6',
      },
      {
        email: 'juan.gonzalez@forjasafe.cl',
        password: DEFAULT_PASSWORD,
        nombre: 'Juan Manuel González Contreras',
        rol: 'lider',
        cargo: 'Maestro Mayor',
        rut: '13.652.665-0',
      },
      {
        email: 'pablo.guerra@forjasafe.cl',
        password: DEFAULT_PASSWORD,
        nombre: 'Pablo Andrés Cristofer Guerra Chacana',
        rol: 'lider',
        cargo: 'Soldador',
        rut: '17.635.456-9',
      },
      {
        email: 'brayan.olmos@forjasafe.cl',
        password: DEFAULT_PASSWORD,
        nombre: 'Brayan Nicolas Olmos Ahumada',
        rol: 'lider',
        cargo: 'Soldador',
        rut: '20.082.074-6',
      },
      {
        email: 'cristian.rojas@forjasafe.cl',
        password: DEFAULT_PASSWORD,
        nombre: 'Cristian Rodrigo Rojas Segura',
        rol: 'lider',
        cargo: 'Maestro Mayor',
        rut: '12.140.137-1',
      },
      {
        email: 'jose.urrutia@forjasafe.cl',
        password: DEFAULT_PASSWORD,
        nombre: 'Jose Martin Urrutia Contreras',
        rol: 'lider',
        cargo: 'Maestro Primera Mecánico',
        rut: '21.659.153-4',
      },
      {
        email: 'jaime.vargas@forjasafe.cl',
        password: DEFAULT_PASSWORD,
        nombre: 'Jaime Andrés Vargas Ibáñez',
        rol: 'lider',
        cargo: 'Ayudante',
        rut: '22.199.718-2',
      },
      {
        email: 'miguel.vergara@forjasafe.cl',
        password: DEFAULT_PASSWORD,
        nombre: 'Miguel Fernando Vergara Cisterna',
        rol: 'lider',
        cargo: 'Maestro Primera',
        rut: '22.153.767-k',
      },
    ];

    let creados = 0;
    let omitidos = 0;

    for (const u of usuarios) {
      const existing = await Usuario.findOne({ where: { email: u.email } });
      if (existing) {
        await existing.update({
          nombre: u.nombre,
          rol: u.rol,
          activo: true,
          certificaciones_json: { rut: u.rut, cargo: u.cargo },
        });
        console.log(`  ↻ [${u.rol.toUpperCase().padEnd(6)}] ${u.nombre} — actualizado.`);
        omitidos++;
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
        certificaciones_json: { rut: u.rut, cargo: u.cargo },
      });
      console.log(`  ✓ [${u.rol.toUpperCase().padEnd(6)}] ${u.nombre} <${u.email}>`);
      creados++;
    }

    console.log(`\n✅ Seed completado: ${creados} creados, ${omitidos} omitidos.`);
    console.log('\n--- GERENTE ---');
    console.log('   raul.diaz@forjasafe.cl  / forja2024');
    console.log('\n--- JEFES (aprueban documentación) ---');
    console.log('   cristian.arancibia@forjasafe.cl  / forja2024');
    console.log('   leslye.cabrera@forjasafe.cl      / forja2024');
    console.log('   edgardo.garcia@forjasafe.cl      / forja2024');
    console.log('   alexis.olivares@forjasafe.cl     / forja2024');
    console.log('   jorge.vilches@forjasafe.cl       / forja2024');
    console.log('\n--- OPERARIOS (crean permisos) ---');
    console.log('   cristian.collao@forjasafe.cl     / forja2024');
    console.log('   ismael.rozas@forjasafe.cl        / forja2024');
    console.log('   ... (19 operarios, misma contraseña)');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error en seed:', error.message);
    process.exit(1);
  }
};

seed();
