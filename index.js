'use strict';
const Koa = require('koa');
const app = new Koa();
const MqttServer = require('./mqtt-server');
const server = new MqttServer();

server.ready(() => {
  server.on('published', (message, client) => {
    console.log(message);
  });
  app.use(ctx => {
    const query = ctx.query;
    const action = query.action;
    const target = query.target;
    server.publish('midway-iot', {
      action,
      target,
    });
    ctx.body = 'done';
  });
  const port = 80;
  app.listen(port, () => {
    console.log(`app is listening on ${port}`);
  });
});
