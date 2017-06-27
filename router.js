'use strict';
const Router = require('koa-router');
const router = new Router();

router.get('/', function*() {
  yield this.render('index');
});

router.get('/switch', function*() {
  const app = this.app;
  const query = this.query;
  const action = query.action;
  const target = query.target;
  const clients = app.server.clients;
  if (!clients.size) {
    return this.body = {
      success: false,
      error: 'no connected client'
    };
  }
  app.server.publish('midway-iot', {
    action,
    target,
  });
  this.body = {
    success: true,
  };
});

router.get('/status', function*() {
  const metric = this.query.metric;
  const data = yield this.app.queryData(metric);
  this.body = JSON.parse(data);
});

module.exports = router;
