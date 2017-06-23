'use strict';
const Koa = require('koa');
const app = new Koa();
const MqttServer = require('./mqtt-server');
const server = new MqttServer();

server.ready(() => {
  app.use(ctx => {
    const query = ctx.query;
    const action = query.action;
    const target = query.target;
    server.publish('midway-iot', {
      action,
      target,
    });
    this.body = query;
  });

  app.listen(3000);
});
