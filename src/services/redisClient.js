const Redis = require('ioredis');
const client = new Redis(process.env.REDIS_URL);

client.on('error', err => console.error('[REDIS ERROR]', err));
module.exports = client;