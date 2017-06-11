import getUser from './User';
import getTaskStatus from './TaskStatus';
import getTask from './Task';
import getTag from './Tag';
import getTaskTag from './TaskTag';

export default (connect) => {
  const models = {
    User: getUser(connect),
    TaskStatus: getTaskStatus(connect),
    Task: getTask(connect),
    Tag: getTag(connect),
    TaskTag: getTaskTag(connect),
  };

  models.User.hasMany(models.Task, { foreignKey: 'creatorId', as: 'creator' });
  models.User.hasMany(models.Task, { foreignKey: 'assignedToId', as: 'assignedTo' });
  models.TaskStatus.hasMany(models.Task, { foreignKey: 'statusId' });
  models.Task.belongsTo(models.User, { foreignKey: 'creatorId', as: 'creator' });
  models.Task.belongsTo(models.User, { foreignKey: 'assignedToId', as: 'assignedTo' });
  models.Task.belongsTo(models.TaskStatus, { foreignKey: 'statusId' });
  models.Task.belongsToMany(models.Tag, { through: 'TaskTag' });
  models.Tag.belongsToMany(models.Task, { through: 'TaskTag' });

  return models;
};
