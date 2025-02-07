import {
    runKafkaConsumer,
    subscribeToFinishSprintEvent,
    subscribeToStartSprintEvent,
} from './kafkaConsumer.js';

const startKafkaSubscriptionsAsync = async (container) => {
    try {
        const taskService = container.resolve('taskService');
        await subscribeToStartSprintEvent();
        await subscribeToFinishSprintEvent();
        await runKafkaConsumer(taskService);
        console.log('Kafka subscription started.');
    } catch (error) {
        console.error('Error starting Kafka subscription:', error);
    }
};

export default startKafkaSubscriptionsAsync;
