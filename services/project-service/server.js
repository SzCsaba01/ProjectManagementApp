import { app, container } from './app.js';
import {
    connectDB,
    disconnectRedisClient,
    initializeRedis,
} from './src/config/index.js';
import {
    connectKafkaUserConsumerAsync,
    disconnectKafkaUserConsumerAsync,
    connectKafkaProjectProducerAsync,
    disconnectKafkaProjectProducerAsync,
    startKafkaUserSubscriptionsAsync,
} from './src/kafka/index.js';

const port = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await connectDB();
        await initializeRedis();

        await connectKafkaProjectProducerAsync();
        await connectKafkaUserConsumerAsync();
        await startKafkaUserSubscriptionsAsync(container);

        app.listen(port, () => {
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
        await disconnectKafkaProjectProducerAsync();
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
        await disconnectKafkaUserConsumerAsync();
        await disconnectKafkaProjectProducerAsync();

        console.log('Express server closed.');
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
});
