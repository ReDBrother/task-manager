import Rollbar from 'rollbar';
import dotenv from 'dotenv';

dotenv.config();

export default new Rollbar(process.env.ROLLBAR_TOKEN);
