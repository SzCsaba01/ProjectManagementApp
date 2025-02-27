import { createClient } from 'redis';

let redisclient = null;

const getRedisClient = () => {
    if (redisclient) {
        return redisclient;
    }

    redisclient = createClient({
        url: process.env.REDIS_URL,
    });

    redisclient.on('error', (err) => console.error('redis error:', err));

    return redisclient;
};

const connectRedisClient = async () => {
    try {
        const redisclient = getRedisClient();
        await redisclient.connect();
        console.log('Redis client connected successfully');
    } catch (error) {
        console.error('error connecting redis client: ' + error);
    }
};

const disconnectRedisClient = async () => {
    try {
        const redisclient = getRedisClient();
        await redisclient.disconnectredisclient();
    } catch (error) {
        console.error('error disconnecting redis client: ' + error);
    }
};

const ensureIndex = async (schema, indexName, prefix) => {
    try {
        const redisclient = getRedisClient();
        await redisclient.ft.create(indexName, schema, {
            on: 'hash',
            prefix: prefix,
            MINIMUM_TOKEN_LENGTH: 1,
        });
        console.log(`${indexName} index created`);
    } catch (err) {
        if (err.message.includes('index already exists')) {
            console.log(`${indexName} index already exists`);
        } else {
            console.error(`error creating index: ${err}`);
        }
    }
};

const initializeRedis = async () => {
    try {
        await connectRedisClient();
    } catch (error) {
        console.error('Error initializing Redis:', error);
    }
};

export { getRedisClient, initializeRedis, disconnectRedisClient };
