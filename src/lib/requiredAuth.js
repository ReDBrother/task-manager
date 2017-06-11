export default async (ctx, next) => {
  const id = ctx.session.userId;
  if (!id) {
    ctx.flash.set('Sorry, you have to sign in first');
    ctx.redirect('/session/new');
    return;
  }

  await next();
};
