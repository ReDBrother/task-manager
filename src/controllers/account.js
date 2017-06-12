import buildFormObj from '../lib/formObjectBuilder';
import encrypt from '../lib/secure';
import requiredAuth from '../lib/requiredAuth';

export default (router, { User }) => {
  router
    .get('account', '/my/account', requiredAuth, async (ctx) => {
      const id = ctx.session.userId;
      const user = await User.findById(id);
      ctx.render('account', { f: buildFormObj(user), user });
    })
    .patch('account', '/my/account', requiredAuth, async (ctx) => {
      const id = ctx.session.userId;
      const user = await User.findById(id);
      const form = ctx.request.body.form;
      try {
        await user.update(form);
        ctx.flash.set('User has been updated');
        ctx.redirect(router.url('account'));
      } catch (e) {
        ctx.render('account', { f: buildFormObj(form, e), user });
      }
    })
    .get('password', '/my/password', requiredAuth, async (ctx) => {
      const id = ctx.session.userId;
      const user = await User.findById(id);
      ctx.render('account/password', { f: buildFormObj({}), user });
    })
    .patch('password', '/my/password', requiredAuth, async (ctx) => {
      const id = ctx.session.userId;
      const user = await User.findById(id);
      const { password,
        newPassword,
        confirmation,
      } = ctx.request.body.form;
      try {
        if (user.passwordDigest !== encrypt(password)) {
          ctx.flash.set('Wrong password');
        } else if (newPassword !== confirmation) {
          ctx.flash.set('Password doesn\'t match confirmation');
        } else {
          await user.update({ password: newPassword });
          ctx.flash.set('Password has been updated');
        }
      } catch (e) {
        ctx.flash.set('New password is not valid');
      }

      ctx.redirect(router.url('password'));
    })
    .delete('account', '/my/account', async (ctx) => {
      const id = ctx.session.userId;
      if (id) {
        await User.destroy({ where: { id } });
        ctx.session = {};
      }
      ctx.redirect(router.url('root'));
    });
};
