import requiredAuth from '../lib/requiredAuth';
import buildFormObj from '../lib/formObjectBuilder';

export default (router, { TaskStatus }) => {
  router
    .get('statuses', '/statuses', async (ctx) => {
      const statuses = await TaskStatus.findAll();
      ctx.render('statuses', { statuses });
    })
    .get('newStatus', '/statuses/new', requiredAuth, (ctx) => {
      const status = TaskStatus.build();
      ctx.render('statuses/new', { f: buildFormObj(status) });
    })
    .post('newStatus', '/statuses/new', requiredAuth, async (ctx) => {
      const form = ctx.request.body.form;
      try {
        await TaskStatus.create(form);
        ctx.flash.set('Status has been created');
        ctx.redirect(router.url('newStatus'));
      } catch (e) {
        ctx.render('statuses/new', { f: buildFormObj(form, e) });
      }
    })
    .get('status', '/statuses/:id', requiredAuth, async (ctx) => {
      const statusId = Number(ctx.params.id);
      const status = await TaskStatus.findById(statusId);
      if (!status) {
        ctx.redirect(router.url('statuses'));
        return;
      }

      ctx.render('statuses/config', { f: buildFormObj(status), statusId });
    })
    .post('/statuses/:id', requiredAuth, async (ctx) => {
      const statusId = Number(ctx.params.id);
      const status = await TaskStatus.findById(statusId);
      if (!status) {
        ctx.redirect(router.url('statuses'));
        return;
      }

      const form = ctx.request.body.form;
      try {
        await status.update(form);
        ctx.flash.set('Status has been updated');
        ctx.redirect(`/statuses/${statusId}`);
      } catch (e) {
        ctx.render('statuses/config', { f: buildFormObj(form, e), statusId });
      }
    })
    .delete('/statuses/:id', requiredAuth, async (ctx) => {
      const statusId = Number(ctx.params.id);
      await TaskStatus.destroy({ where: { id: statusId } });
      ctx.flash.set('Status has been destroy');
      ctx.redirect(router.url('root'));
    });
};
