import dotenv from 'dotenv';
import Sequelize from 'sequelize';

dotenv.config();

export default new Sequelize(process.env.DATABASE_URL);
