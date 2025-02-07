import { Kafka } from 'kafkajs';
import { NotFoundError } from '../errors/index.js';

let kafkaConsumer = null;

const getKafkaConsumer = () => {
    if (!kafkaConsumer) {
        const kafka = new Kafka({
            clientId: process.env.KAFKA_CLIENT_ID,
            brokers: [process.env.KAFKA_BROKER_URL],
        });
        kafkaConsumer = kafka.consumer({
            groupId: process.env.KAFKA_CONSUMER_GROUP_ID,
        });
    }
    return kafkaConsumer;
};

const connectKafkaAsync = async () => {
    try {
        const consumer = getKafkaConsumer();
        await consumer.connect();
        console.log('Kafka connected successfully!');
    } catch (error) {
        console.error('Error connecting to Kafka:', error);
    }
};

const disconnectKafkaAsync = async () => {
    try {
        const consumer = getKafkaConsumer();
        await consumer.disconnect();
        console.log('Kafka consumer disconnected.');
    } catch (error) {
        console.error('Error disconnecting Kafka consumer:', error);
    }
};

const subscribeToAddUsersToProjectEvent = async () => {
    const consumer = getKafkaConsumer();
    await consumer.subscribe({
        topic: process.env.KAFKA_ADD_USERS_TO_PROJECT_TOPIC,
        fromBeginning: false,
    });
};

const subscribeToRemoveUsersFromProjectEvent = async () => {
    const consumer = getKafkaConsumer();
    await consumer.subscribe({
        topic: process.env.KAFKA_REMOVE_USERS_FROM_PROJECT_TOPIC,
        fromBeginning: false,
    });
};

const runKafkaConsumer = async (userService) => {
    const consumer = getKafkaConsumer();
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
    connectKafkaAsync,
    disconnectKafkaAsync,
    subscribeToAddUsersToProjectEvent,
    subscribeToRemoveUsersFromProjectEvent,
    runKafkaConsumer,
};
