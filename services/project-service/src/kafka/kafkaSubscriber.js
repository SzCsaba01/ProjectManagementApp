import {
    runKafkaConsumer,
    subscribeToCreateTaskTopic,
    subscribeToDeleteTaskTopic,
} from './kafkaConsumer.js';

const startKafkaSubscriptionsAsync = async (container) => {
    try {
        const backlogService = container.resolve('backlogService');
        const sprintService = container.resolve('sprintService');
        await subscribeToCreateTaskTopic();
        await subscribeToDeleteTaskTopic();
        await runKafkaConsumer(backlogService, sprintService);
        console.log('Kafka subscription started.');
    } catch (error) {
        console.error('Error starting Kafka subscription:', error);
    }
};

export default startKafkaSubscriptionsAsync;
