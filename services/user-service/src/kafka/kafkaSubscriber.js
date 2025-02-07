import {
    runKafkaConsumer,
    subscribeToAddUsersToProjectEvent,
    subscribeToRemoveUsersFromProjectEvent,
} from './kafkaConsumer.js';

const startKafkaSubscriptionsAsync = async (container) => {
    try {
        const userService = container.resolve('userService');
        await subscribeToRemoveUsersFromProjectEvent();
        await subscribeToAddUsersToProjectEvent();
        await runKafkaConsumer(userService);
        console.log('Kafka subscription started.');
    } catch (error) {
        console.error('Error starting Kafka subscription:', error);
    }
};

export default startKafkaSubscriptionsAsync;
