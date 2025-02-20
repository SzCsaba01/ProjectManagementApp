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
        console.log('Kafka connected successfully!');
    } catch (error) {
        console.error('Error connecting to Kafka:', error);
    }
};

const disconnectKafkaProjectConsumerAsync = async () => {
    try {
        const consumer = getKafkaProjectConsumer();
        await consumer.disconnect();
        console.log('Kafka consumer disconnected.');
    } catch (error) {
        console.error('Error disconnecting Kafka consumer:', error);
    }
};

const subscribeToAddUsersToProjectEvent = async () => {
    const consumer = getKafkaProjectConsumer();
    await consumer.subscribe({
        topic: process.env.KAFKA_ADD_USERS_TO_PROJECT_TOPIC,
        fromBeginning: false,
    });
};

const subscribeToRemoveUsersFromProjectEvent = async () => {
    const consumer = getKafkaProjectConsumer();
    await consumer.subscribe({
        topic: process.env.KAFKA_REMOVE_USERS_FROM_PROJECT_TOPIC,
        fromBeginning: false,
    });
};

const runKafkaProjectConsumer = async (userService) => {
    const consumer = getKafkaProjectConsumer();
    await consumer.run({
        eachMessage: async ({ topic, _partition, message }) => {
            console.log(
                `Received message on topic ${topic}: ${message.value.toString()}`,
            );

            const userData = JSON.parse(message.value.toString());
            try {
                switch (topic) {
                    case process.env.KAFKA_ADD_USERS_TO_PROJECT_TOPIC:
                        await userService.addUsersToProjectAsync(userData);
                        break;
                    case process.env.KAFKA_REMOVE_USERS_FROM_PROJECT_TOPIC:
                        await userService.removeUsersFromProjectAsync(userData);
                        break;
                    default:
                        throw new NotFoundError('No topic were found!');
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
    subscribeToAddUsersToProjectEvent,
    subscribeToRemoveUsersFromProjectEvent,
    runKafkaProjectConsumer,
};
