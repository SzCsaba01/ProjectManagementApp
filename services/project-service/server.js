import { app, container } from './app.js';
import { connectDB } from './src/config/index.js';
import {
    connectKafkaConsumerAsync,
    disconnectKafkaConsumerAsync,
    connectKafkaProducerAsync,
    disconnectKafkaProducerAsync,
    startKafkaSubscriptionsAsync,
} from './src/kafka/index.js';

const port = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await connectDB();

        await connectKafkaProducerAsync();
        await connectKafkaConsumerAsync();
        // await startKafkaSubscriptionsAsync(container);

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
        await disconnectKafkaProducerAsync();
        await disconnectKafkaConsumerAsync();
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
        await disconnectKafkaConsumerAsync();
        await disconnectKafkaProducerAsync();

        console.log('Express server closed.');
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
});
