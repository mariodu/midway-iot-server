'use strict';
const Koa = require('koa');
const MqttServer = require('./mqtt-server');
const server = new MqttServer();
const router = require('./router');
const data = {};

server.ready(() => {
  const app = new Koa();
  const redis = server.redisClient;
  app.server = server;
  app.use(router.routes());
  app.queryData = function(metric) {
    return redis.get(metric);
  }
  server.on('published', (message, client) => {
    try {
      const msg = JSON.parse(message);
      const metric = msg.metric;
      const value = msg.value;
      if (!data[metric]) {
        data[metric] = [];
      }
      data[metric].push({
        time: Date.now(),
        value,
      });
      if (data[metric].length > 1000) {
        data[metric] = data[metric].slice(-1000);
      }
      redis.put(metric, JSON.stringify(data[metric]));
    } catch (err) {
      console.error(err);
    }
  });

  const port = 80;
  app.listen(port, () => {
    console.log(`app is listening on ${port}`);
  });
});
