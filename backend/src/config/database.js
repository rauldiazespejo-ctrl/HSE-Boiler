require('dotenv').config();
const { Sequelize } = require('sequelize');

const isProduction = process.env.NODE_ENV === 'production';
const useDatabaseUrl = Boolean(process.env.DATABASE_URL);

const connectionOptions = {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 20,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: isProduction
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
    : undefined,
};

const sequelize = useDatabaseUrl
  ? new Sequelize(process.env.DATABASE_URL, connectionOptions)
  : new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
      ...connectionOptions,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
    });

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

module.exports = {
  sequelize,
  testConnection
};
