import Rollbar from 'rollbar';

export default new Rollbar(process.env.ROLLBAR_TOKEN);
