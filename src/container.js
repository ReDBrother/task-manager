import getModels from './models';
import connect from './db';
import logger from './lib/logger';

const models = getModels(connect);

export default { logger, ...models };
