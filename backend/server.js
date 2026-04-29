require('dotenv').config();
const app = require('./src/app');
const { sequelize, testConnection } = require('./src/config/database');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await testConnection();
    // In a real scenario, use migrations instead of sync({ force: false })
    // await sequelize.sync({ force: false });
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
