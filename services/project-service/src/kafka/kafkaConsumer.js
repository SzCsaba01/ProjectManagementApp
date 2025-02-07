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

const connectKafkaConsumerAsync = async () => {
    try {
        const consumer = getKafkaConsumer();
        await consumer.connect();
        console.log('Kafka consumer connected successfully!');
    } catch (error) {
        console.error('Error connecting to Kafka:', error);
    }
};

const disconnectKafkaConsumerAsync = async () => {
    try {
        const consumer = getKafkaConsumer();
        await consumer.disconnect();
        console.log('Kafka consumer disconnected.');
    } catch (error) {
        console.error('Error disconnecting Kafka consumer:', error);
    }
};

const subscribeToCreateTaskTopic = async () => {
    const consumer = getKafkaConsumer();
    await consumer.subscribe({
        topic: process.env.KAFKA_CREATE_TASK_TOPIC,
        fromBeginning: false,
    });
};

const subscribeToDeleteTaskTopic = async () => {
    const consumer = getKafkaConsumer();
    await consumer.subscribe({
        topic: process.env.KAFKA_DELETE_TASK_TOPIC,
        fromBeginning: false,
    });
};

const runKafkaConsumer = async (backlogService, sprintService) => {
    const consumer = getKafkaConsumer();
    await consumer.run({
        eachMessage: async ({ topic, _partition, message }) => {
            console.log(
                `Received message on topic ${topic}: ${message.value.toString()}`,
            );

            const taskData = JSON.parse(message.value.toString());
        },
    });
};

export {
    connectKafkaConsumerAsync,
    disconnectKafkaConsumerAsync,
    subscribeToDeleteTaskTopic,
    subscribeToCreateTaskTopic,
    runKafkaConsumer,
};
