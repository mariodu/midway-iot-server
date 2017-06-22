'use strict';

const mosca = require('mosca');
const Redis = require('ioredis');

const pubsubSettings = {
  type: 'redis',
  redis: Redis,
  port: 6379,
  host: '127.0.0.1',
  password: 'midway_iot_server',
  return_buffers: true
};

const moscaSettings = {
  port: 1883,
  backend: pubsubSettings
};

const server = new mosca.Server(moscaSettings);

server.on('ready', function ready() {
  console.log('Mosca server is up and running');
});

server.on('published', function(packet, client) {
  console.log('Published', packet);
  console.log('Client', client);
});

server.on('clientConnected', function(client) {
  console.log('Client Connected:', client.id);
});

server.on('clientDisconnected', function(client) {
  console.log('Client Disconnected:', client.id);
});