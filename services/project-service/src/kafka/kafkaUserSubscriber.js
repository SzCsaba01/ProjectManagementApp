import {
    subscribeToDeleteUserEvent,
    runKafkaUserConsumer,
} from './kafkaUserConsumer.js';

const startKafkaUserSubscriptionsAsync = async (container) => {
    try {
        const projectService = container.resolve('projectService');
        await subscribeToDeleteUserEvent();
        await runKafkaUserConsumer(projectService);
        console.log('Kafka user subscription started.');
    } catch (error) {
        console.error('Error starting Kafka user subscription:', error);
    }
};

export default startKafkaUserSubscriptionsAsync;
