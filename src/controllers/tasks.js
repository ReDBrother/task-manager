import url from 'url';
import _ from 'lodash';
import buildFormObj from '../lib/formObjectBuilder';
import requiredAuth from '../lib/requiredAuth';

const getUserItems = async (User, id) => {
  const users = await User.findAll();
  return users.map((user) => {
    if (id && user.id === id) {
      return { id: user.id, name: '<< me >>' };
    }

    return { id: user.id, name: user.fullName };
  });
};

const getFilters = (query) => {
  const template = {
    creator: { id: Number(query.creator) },
    status: { id: Number(query.status) },
    tag: { name: { $like: `%${query.tag}%` } },
    assignedTo: { id: Number(query.assignedTo) },
  };

  return Object.keys(template).reduce((acc, key) => {
    if (query[key] === '0' || query[key] === '' || query[key] === undefined) {
      return { ...acc, [key]: {} };
    }

    return { ...acc, [key]: template[key] };
  }, {});
};

export default (router, { User, TaskStatus, Task, Tag }) => {
  router
    .get('tasks', '/tasks', async (ctx) => {
      const id = ctx.session.userId;
      const { query } = url.parse(ctx.request.url, true);
      const filters = getFilters(query);
      const tasks = await Task.findAll({
        include: [
          { model: User, as: 'creator', where: filters.creator },
          { model: TaskStatus, where: filters.status },
          _.isEmpty(filters.tag) ? { model: Tag } : { model: Tag, where: filters.tag },
          { model: User, as: 'assignedTo', where: filters.assignedTo },
        ],
      });
      const userItems = [{ id: 0, name: 'all' }, ...await getUserItems(User, id)];
      const statuses = [{ id: 0, name: 'all' }, ...await TaskStatus.findAll()];

      ctx.render('tasks', { f: buildFormObj(query), tasks, userItems, statuses });
    })
    .get('newTask', '/tasks/new', requiredAuth, async (ctx) => {
      const id = ctx.session.userId;
      const userItems = await getUserItems(User, id);
      const statuses = await TaskStatus.findAll();
      const task = Task.build();
      ctx.render('tasks/new', { f: buildFormObj(task), id, userItems, statuses });
    })
    .post('tasks', '/tasks', requiredAuth, async (ctx) => {
      const id = ctx.session.userId;
      const form = ctx.request.body.form;
      try {
        await Task.create({
          name: form.name,
          description: form.description,
          statusId: form.status,
          creatorId: id,
          assignedToId: form.assignedTo,
        });
        ctx.flash.set('Task has been created');
        ctx.redirect(router.url('tasks'));
      } catch (e) {
        const userItems = await getUserItems(User, id);
        const statuses = await TaskStatus.findAll();
        ctx.render('tasks/new', { f: buildFormObj(form, e), id, userItems, statuses });
      }
    })
    .get('task', '/tasks/:id', async (ctx) => {
      const taskId = Number(ctx.params.id);
      const task = await Task.findById(taskId);
      if (!task) {
        ctx.redirect(router.url('tasks'));
        return;
      }

      const creator = await User.findById(task.creatorId);
      const status = await TaskStatus.findById(task.statusId);
      const assigned = task.assignedToId ? await User.findById(task.assignedToId) : 'none';
      const tags = await Tag.findAll({
        include: [
          { model: Task, where: { id: taskId } },
        ],
      });
      const tag = Tag.build();
      ctx.render('tasks/info', { f: buildFormObj(tag), task, creator, status, assigned, tags });
    })
    .post('tags', '/tasks/:id', requiredAuth, async (ctx) => {
      const taskId = Number(ctx.params.id);
      const task = await Task.findById(taskId);
      if (!task) {
        ctx.redirect(router.url('tasks'));
        return;
      }

      const form = ctx.request.body.form;
      try {
        const tag = await Tag.create(form);
        await task.addTag(tag);
        ctx.flash.set('Tag has been created');
      } catch (e) {
        ctx.flash.set('Name is no valid');
      }

      ctx.redirect(router.url('task', taskId));
    })
    .get('editTask', '/tasks/:id/edit', requiredAuth, async (ctx) => {
      const id = ctx.session.userId;
      const taskId = Number(ctx.params.id);
      const task = await Task.findById(taskId);
      if (!task) {
        ctx.redirect(router.url('tasks'));
        return;
      }
      const userItems = await getUserItems(User, id);
      const statuses = await TaskStatus.findAll();

      ctx.render('tasks/edit', { f: buildFormObj(task), task, userItems, statuses });
    })
    .patch('updateTask', '/tasks/:id/edit', requiredAuth, async (ctx) => {
      const id = ctx.session.userId;
      const taskId = Number(ctx.params.id);
      const task = await Task.findById(taskId);
      if (!task) {
        ctx.redirect(router.url('tasks'));
        return;
      }

      const form = ctx.request.body.form;
      try {
        await task.update({
          name: form.name,
          description: form.description,
          statusId: form.status,
          assignedToId: form.assignedTo,
        });

        ctx.flash.set('task has been updated');
        ctx.redirect(router.url('editTask', taskId));
      } catch (e) {
        const userItems = await getUserItems(User, id);
        const statuses = await TaskStatus.findAll();
        ctx.render('tasks/edit', { f: buildFormObj(form, e), task, userItems, statuses });
      }
    })
    .delete('destroyTask', '/tasks/:id', requiredAuth, async (ctx) => {
      const taskId = Number(ctx.params.id);
      await Task.destroy({ where: { id: taskId } });
      ctx.flash.set('Task has been destroy');
      ctx.redirect(router.url('tasks'));
    });
};
