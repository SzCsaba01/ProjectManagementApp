import {
    subscribeToDeleteUserEvent,
    runKafkaUserConsumer,
} from './kafkaUserConsumer.js';

const startKafkaUserSubscriptionsAsync = async (container) => {
    try {
        const taskService = container.resolve('taskService');
        await subscribeToDeleteUserEvent();
        await runKafkaUserConsumer(taskService);
        console.log('Kafka user subscription started.');
    } catch (error) {
        console.error('Error starting Kafka user subscription:', error);
    }
};

export default startKafkaUserSubscriptionsAsync;
