'use strict';
const Koa = require('koa');
const app = new Koa();
const MqttServer = require('./mqtt-server');
const server = new MqttServer();

server.ready(() => {
  server.on('published', (message, client) => {
    try {
      const data = JSON.parse(message);
      console.log(data);
    } catch (err) {
      console.error(err);
    }
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
