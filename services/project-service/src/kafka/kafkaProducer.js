import { Kafka } from 'kafkajs';

let kafkaProducer = null;

const getKafkaProducer = () => {
    if (!kafkaProducer) {
        const kafka = new Kafka({
            clientId: process.env.KAFKA_CLIENT_ID,
            brokers: [process.env.KAFKA_BROKER_URL],
        });
        kafkaProducer = kafka.producer();
    }
    return kafkaProducer;
};

const connectKafkaProducerAsync = async () => {
    try {
        const producer = getKafkaProducer();
        await producer.connect();
        console.log('Kafka producer connected successfully!');
    } catch (error) {
        console.error('Error connecting Kafka producer:', error);
    }
};

const disconnectKafkaProducerAsync = async () => {
    try {
        const producer = getKafkaProducer();
        await producer.disconnect();
        console.log('Kafka producer disconnected.');
    } catch (error) {
        console.error('Error disconnecting Kafka producer:', error);
    }
};

const publishMessageAsync = async (topic, message) => {
    try {
        const producer = getKafkaProducer();
        await producer.send({
            topic: topic,
            messages: [
                {
                    value: JSON.stringify(message),
                },
            ],
        });
        console.log(`Message published to topic ${topic}`);
    } catch (error) {
        console.error('Error publishing message:', error);
    }
};

export {
    connectKafkaProducerAsync,
    disconnectKafkaProducerAsync,
    publishMessageAsync,
};
