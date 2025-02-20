import {
    runKafkaProjectConsumer,
    subscribeToAddUsersToProjectEvent,
    subscribeToRemoveUsersFromProjectEvent,
} from './kafkaProjectConsumer.js';

const startKafkaProjectSubscriptionsAsync = async (container) => {
    try {
        const userService = container.resolve('userService');
        await subscribeToRemoveUsersFromProjectEvent();
        await subscribeToAddUsersToProjectEvent();
        await runKafkaProjectConsumer(userService);
        console.log('Kafka project subscription started.');
    } catch (error) {
        console.error('Error starting Kafka project subscription:', error);
    }
};

export default startKafkaProjectSubscriptionsAsync;
