'use strict';
const Router = require('koa-router');
const router = new Router();

router.get('/switch', function (ctx, next) {
  const app = ctx.app;
  const query = ctx.query;
  const action = query.action;
  const target = query.target;
  app.server.publish('midway-iot', {
    action,
    target,
  });
  ctx.body = 'done';
});


router.get('/status', async (ctx) => {
  const metric = ctx.query.metric;
  const data = await ctx.app.getData(metric);
  ctx.body = data;
});

module.exports = router;
