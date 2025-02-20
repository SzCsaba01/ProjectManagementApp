import { Kafka } from 'kafkajs';
import { NotFoundError } from '../errors/index.js';

let kafkaUserConsumer = null;

const getKafkaUserConsumer = () => {
    if (!kafkaUserConsumer) {
        const kafka = new Kafka({
            clientId: process.env.KAFKA_CLIENT_ID,
            brokers: [process.env.KAFKA_BROKER_URL],
        });
        kafkaUserConsumer = kafka.consumer({
            groupId: process.env.KAFKA_USER_CONSUMER_GROUP_ID,
        });
    }
    return kafkaUserConsumer;
};

const connectKafkaUserConsumerAsync = async () => {
    try {
        const consumer = getKafkaUserConsumer();
        await consumer.connect();
        console.log('Kafka user consumer connected successfully!');
    } catch (error) {
        console.error('Error connecting to user Kafka:', error);
    }
};

const disconnectKafkaUserConsumerAsync = async () => {
    try {
        const consumer = getKafkaUserConsumer();
        await consumer.disconnect();
        console.log('Kafka user consumer disconnected.');
    } catch (error) {
        console.error('Error disconnecting user Kafka consumer:', error);
    }
};

const subscribeToDeleteUserEvent = async () => {
    const consumer = getKafkaUserConsumer();
    await consumer.subscribe({
        topic: process.env.KAFKA_DELETE_USER_TOPIC,
        fromBeginning: false,
    });
};

const runKafkaUserConsumer = async (projectService) => {
    const consumer = getKafkaUserConsumer();
    await consumer.run({
        eachMessage: async ({ topic, _partition, message }) => {
            console.log(
                `Received project message on topic ${topic}: ${message.value.toString()}`,
            );

            const messageData = JSON.parse(message.value.toString());
            try {
                switch (topic) {
                    case process.env.KAFKA_DELETE_USER_TOPIC: {
                        await projectService.removeUserFromProjectsAsync(
                            messageData.userId,
                        );
                        break;
                    }
                    default: {
                        throw new NotFoundError('No user topic were found!');
                    }
                }
            } catch (error) {
                console.log(error);
            }
        },
    });
};

export {
    connectKafkaUserConsumerAsync,
    disconnectKafkaUserConsumerAsync,
    subscribeToDeleteUserEvent,
    runKafkaUserConsumer,
};
