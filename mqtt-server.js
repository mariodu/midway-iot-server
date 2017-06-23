'use strict';

const mosca = require('mosca');
const Redis = require('ioredis');
const Base = require('sdk-base');

const pubsubSettings = {
  type: 'redis',
  redis: Redis,
  port: 6379,
  host: '127.0.0.1',
  password: 'midway_iot_server',
  return_buffers: true
};

const redisClient = new Redis(pubsubSettings);
const data = { };

const moscaSettings = {
  port: 1883,
  backend: pubsubSettings
};

class Server extends Base {
  constructor(options) {
    super(options);
    const server = new mosca.Server(moscaSettings);
    const clients = new Map();
    server.on('ready', () => {
      console.log('Mosca server is up and running');
      this.ready(true);
    });
    server.on('clientConnected', (client) => {
      console.log('Client Connected:', client.id);
      clients.set(client.id, client);
    });

    server.on('clientDisconnected', (client) => {
      console.log('Client Disconnected:', client.id);
      clients.delete(client.id);
    });

    // fired when a message is received
    server.on('published', (packet, client) => {
      console.log('received', packet);
      console.log('Client', client);
      this.emit('published', packet, client);
    });

    this.server = server;
    this.clients = clients;
  }

  publish(topic, payload, client) {
    const message = {
      topic: topic,
      payload: JSON.stringify(payload)
    }

    const server = this.server;
    if (client) {
      this.server.publish(message, client);
    } else {
      const clients = this.clients;
      for(let id of clients.keys()) {
        this.server.publish(message, clients.get(id));
      }
    }
  }
}

module.exports = Server;
