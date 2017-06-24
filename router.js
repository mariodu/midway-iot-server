'use strict';
const Router = require('koa-router');
const router = new Router();

router.get('/switch', function*() {
  const app = this.app;
  const query = this.query;
  const action = query.action;
  const target = query.target;
  app.server.publish('midway-iot', {
    action,
    target,
  });
  this.body = 'done';
});


router.get('/status', function*() {
  const metric = this.query.metric;
  const data = yield this.app.queryData(metric);
  this.body = JSON.parse(data);
});

module.exports = router;
