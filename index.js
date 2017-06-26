'use strict';
const Koa = require('koa');
const MqttServer = require('./mqtt-server');
const server = new MqttServer();
const router = require('./router');
const data = {};
const jsonp = require('koa-jsonp');
const handlebars = require("koa-handlebars");

server.ready(() => {
  const app = new Koa();
  const redis = server.redisClient;
  app.server = server;
  app.use(function*(next) {
    this.set('Access-Control-Allow-Methods', '*');
    this.set('Access-Control-Allow-Origin', '*');
    this.set('Access-Control-Allow-Headers', 'Origin, No-Cache, X-Requested-With, If-Modified-Since, Pragma, Last-Modified, Cache-Control, Expires, Content-Type, X-E4M-With')
    if (this.method === 'OPTIONS') {
      this.status = 200;
    }
    yield next;
  });
  app.use(require('koa-static')(__dirname + '/views/public'));
  app.use(handlebars({
    defaultLayout: "main"
  }));
  app.use(router.routes());

  app.queryData = function(metric) {
    return redis.get(metric);
  }

  server.on('published', (message, client) => {
    if (message.topic === 'sensor') {
      try {
        const msg = JSON.parse(message.payload);
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
        redis.set(metric, JSON.stringify(data[metric]));
      } catch (err) {
        console.log(message.toString());
        console.error(err);
      }
    }
  });

  const port = 80;
  app.listen(port, () => {
    console.log(`app is listening on ${port}`);
  });
});