const redis = require('redis');

let redisClient = null;

const connectRedis = async () => {
  try {
    if (process.env.REDIS_ENABLED !== 'true') {
      console.log('⚠️  Redis is disabled');
      return null;
    }

    redisClient = redis.createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
      },
      password: process.env.REDIS_PASSWORD || undefined
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis Connected');
    });

    await redisClient.connect();
    
    return redisClient;
  } catch (error) {
    console.error(`⚠️  Redis connection error: ${error.message}`);
    console.log('⚠️  Continuing without Redis...');
    return null;
  }
};

const getRedisClient = () => redisClient;

const disconnectRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
  }
};

module.exports = { connectRedis, getRedisClient, disconnectRedis };
