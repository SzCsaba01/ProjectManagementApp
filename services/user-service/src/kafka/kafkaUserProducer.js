import { Kafka } from 'kafkajs';

let kafkaUserProducer = null;

const getKafkaUserProducer = () => {
    if (!kafkaUserProducer) {
        const kafka = new Kafka({
            clientId: process.env.KAFKA_CLIENT_ID,
            brokers: [process.env.KAFKA_BROKER_URL],
        });
        kafkaUserProducer = kafka.producer();
    }
    return kafkaUserProducer;
};

const connectKafkaUserProducerAsync = async () => {
    try {
        const producer = getKafkaUserProducer();
        await producer.connect();
        console.log('Kafka user producer connected successfully!');
    } catch (error) {
        console.error('Error connecting Kafka user producer:', error);
    }
};

const disconnectKafkaUserProducerAsync = async () => {
    try {
        const producer = getKafkaUserProducer();
        await producer.disconnect();
        console.log('Kafka user producer disconnected.');
    } catch (error) {
        console.error('Error disconnecting Kafka user producer:', error);
    }
};

const publishUserMessageAsync = async (topic, message) => {
    try {
        const producer = getKafkaUserProducer();
        await producer.send({
            topic: topic,
            messages: [
                {
                    value: JSON.stringify(message),
                },
            ],
        });
        console.log(`Message published to user topic ${topic}`);
    } catch (error) {
        console.error('Error publishing user message:', error);
    }
};

export {
    connectKafkaUserProducerAsync,
    disconnectKafkaUserProducerAsync,
    publishUserMessageAsync,
};
