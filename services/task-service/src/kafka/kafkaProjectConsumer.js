import { Kafka } from 'kafkajs';
import { NotFoundError } from '../errors/index.js';

let kafkaProjectConsumer = null;

const getKafkaProjectConsumer = () => {
    if (!kafkaProjectConsumer) {
        const kafka = new Kafka({
            clientId: process.env.KAFKA_CLIENT_ID,
            brokers: [process.env.KAFKA_BROKER_URL],
        });
        kafkaProjectConsumer = kafka.consumer({
            groupId: process.env.KAFKA_PROJECT_CONSUMER_GROUP_ID,
        });
    }
    return kafkaProjectConsumer;
};

const connectKafkaProjectConsumerAsync = async () => {
    try {
        const consumer = getKafkaProjectConsumer();
        await consumer.connect();
        console.log('Kafka project consumer connected successfully!');
    } catch (error) {
        console.error('Error connecting to project Kafka:', error);
    }
};

const disconnectKafkaProjectConsumerAsync = async () => {
    try {
        const consumer = getKafkaProjectConsumer();
        await consumer.disconnect();
        console.log('Kafka project consumer disconnected.');
    } catch (error) {
        console.error('Error disconnecting project Kafka consumer:', error);
    }
};

const subscribeToStartSprintEvent = async () => {
    const consumer = getKafkaProjectConsumer();
    await consumer.subscribe({
        topic: process.env.KAFKA_START_SPRINT_TOPIC,
        fromBeginning: false,
    });
};

const subscribeToFinishSprintEvent = async () => {
    const consumer = getKafkaProjectConsumer();
    await consumer.subscribe({
        topic: process.env.KAFKA_FINISH_SPRINT_TOPIC,
        fromBeginning: false,
    });
};

const subscribeToDeleteProjectEvent = async () => {
    const consumer = getKafkaProjectConsumer();
    await consumer.subscribe({
        topic: process.env.KAFKA_DELETE_PROJECT_TOPIC,
        fromBeginning: false,
    });
};

const subscribeToDeleteSprintEvent = async () => {
    const consumer = getKafkaProjectConsumer();
    await consumer.subscribe({
        topic: process.env.KAFKA_DELETE_SPRINT_TOPIC,
        fromBeginning: false,
    });
};

const runKafkaProjectConsumer = async (taskService) => {
    const consumer = getKafkaProjectConsumer();
    await consumer.run({
        eachMessage: async ({ topic, _partition, message }) => {
            console.log(
                `Received project message on topic ${topic}: ${message.value.toString()}`,
            );

            const messageData = JSON.parse(message.value.toString());
            try {
                switch (topic) {
                    case process.env.KAFKA_START_SPRINT_TOPIC: {
                        await taskService.startSprintAsync(messageData);
                        break;
                    }
                    case process.env.KAFKA_FINISH_SPRINT_TOPIC: {
                        await taskService.finishSprintAsync(messageData);
                        break;
                    }
                    case process.env.KAFKA_DELETE_PROJECT_TOPIC: {
                        await taskService.deleteTasksByBacklogIdAsync(
                            messageData.backlogId,
                        );
                        break;
                    }
                    case process.env.KAFKA_DELETE_SPRINT_TOPIC: {
                        await taskService.deleteTasksBySprintIdAsync(
                            messageData.sprintId,
                        );
                        break;
                    }
                    default: {
                        throw new NotFoundError('No project topic were found!');
                    }
                }
            } catch (error) {
                console.log(error);
            }
        },
    });
};

export {
    connectKafkaProjectConsumerAsync,
    disconnectKafkaProjectConsumerAsync,
    subscribeToStartSprintEvent,
    subscribeToFinishSprintEvent,
    subscribeToDeleteProjectEvent,
    subscribeToDeleteSprintEvent,
    runKafkaProjectConsumer,
};
