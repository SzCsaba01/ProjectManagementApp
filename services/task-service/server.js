import { app, container } from './app.js';
import {
    connectDB,
    disconnectRedisClient,
    initializeRedis,
} from './src/config/index.js';
import {
    connectKafkaProjectConsumerAsync,
    connectKafkaUserConsumerAsync,
    startKafkaProjectSubscriptionsAsync,
    startKafkaUserSubscriptionsAsync,
    disconnectKafkaUserConsumerAsync,
    disconnectKafkaProjectConsumerAsync,
} from './src/kafka/index.js';
import http from 'http';
import { initializeWebSocketServer } from './websocket.js';

const port = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await connectDB();
        await initializeRedis();

        await connectKafkaProjectConsumerAsync();
        await connectKafkaUserConsumerAsync();

        await startKafkaProjectSubscriptionsAsync(container);
        await startKafkaUserSubscriptionsAsync(container);
        const server = http.createServer(app);

        initializeWebSocketServer(server);

        server.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Error starting the server:', error);
        process.exit(1);
    }
};

startServer();

process.on('SIGINT', async () => {
    console.log('Received SIGINT. Shutting down...');
    try {
        await disconnectRedisClient();
        await disconnectKafkaProjectConsumerAsync();
        await disconnectKafkaUserConsumerAsync();

        console.log('Express server closed.');
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
});

process.on('SIGTERM', async () => {
    console.log('Received SIGTERM. Shutting down...');
    try {
        await disconnectRedisClient();
        await disconnectKafkaProjectConsumerAsync();
        await disconnectKafkaUserConsumerAsync();

        console.log('Express server closed.');
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
});
