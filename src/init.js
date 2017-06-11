import connect from './db';
import getModels from './models';

export default async () => {
  const models = getModels(connect);
  await Promise.all(Object.values(models).map(model => model.sync()));
  await models.TaskStatus.bulkCreate([
    { name: 'new' },
    { name: 'during' },
    { name: 'testing' },
    { name: 'done' },
  ]);
};
