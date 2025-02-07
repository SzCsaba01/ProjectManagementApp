import { createClient } from 'redis';
import { RedisUserProfileSchema } from '../models/index.js';

let redisClient = null;

const getRedisClient = () => {
    if (redisClient) {
        return redisClient;
    }

    redisClient = createClient({
        url: process.env.REDIS_URL,
    });

    redisClient.on('error', (err) => console.error('Redis Error:', err));

    return redisClient;
};

const connectRedisClient = async () => {
    try {
        const redisClient = getRedisClient();
        await redisClient.connect();
    } catch (error) {
        console.error('Error connecting redis client: ' + error);
    }
};

const disconnectRedisClient = async () => {
    try {
        const redisClient = getRedisClient();
        await redisClient.disconnectRedisClient();
    } catch (error) {
        console.error('Error disconnecting redis client: ' + error);
    }
};

export const ensureIndex = async (schema, indexName, prefix) => {
    try {
        const redisClient = getRedisClient();
        await redisClient.ft.create(indexName, schema, {
            ON: 'HASH',
            PREFIX: prefix,
        });
        console.log(`${indexName} index created`);
    } catch (err) {
        if (err.message.includes('Index already exists')) {
            console.log(`${indexName} index already exists`);
        } else {
            console.error(`Error creating index: ${err}`);
        }
    }
};

export {
    getRedisClient,
    connectRedisClient,
    disconnectRedisClient,
    ensureIndex,
};
