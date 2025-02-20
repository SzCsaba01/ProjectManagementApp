import {
    subscribeToStartSprintEvent,
    subscribeToFinishSprintEvent,
    subscribeToDeleteProjectEvent,
    subscribeToDeleteSprintEvent,
    runKafkaProjectConsumer,
} from './kafkaProjectConsumer.js';

const startKafkaProjectSubscriptionsAsync = async (container) => {
    try {
        const taskService = container.resolve('taskService');
        await subscribeToStartSprintEvent();
        await subscribeToFinishSprintEvent();
        await subscribeToDeleteProjectEvent();
        await subscribeToDeleteSprintEvent();
        await runKafkaProjectConsumer(taskService);
        console.log('Kafka project subscription started.');
    } catch (error) {
        console.error('Error starting Kafka project subscription:', error);
    }
};

export default startKafkaProjectSubscriptionsAsync;
