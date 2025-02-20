import { Kafka } from 'kafkajs';

let kafkaProjectProducer = null;

const getKafkaProjectProducer = () => {
    if (!kafkaProjectProducer) {
        const kafka = new Kafka({
            clientId: process.env.KAFKA_CLIENT_ID,
            brokers: [process.env.KAFKA_BROKER_URL],
        });
        kafkaProjectProducer = kafka.producer();
    }
    return kafkaProjectProducer;
};

const connectKafkaProjectProducerAsync = async () => {
    try {
        const producer = getKafkaProjectProducer();
        await producer.connect();
        console.log('Kafka project producer connected successfully!');
    } catch (error) {
        console.error('Error connecting Kafka project producer:', error);
    }
};

const disconnectKafkaProjectProducerAsync = async () => {
    try {
        const producer = getKafkaProjectProducer();
        await producer.disconnect();
        console.log('Kafka project producer disconnected.');
    } catch (error) {
        console.error('Error disconnecting Kafka project producer:', error);
    }
};

const publishProjectMessageAsync = async (topic, message) => {
    try {
        const producer = getKafkaProjectProducer();
        await producer.send({
            topic: topic,
            messages: [
                {
                    value: JSON.stringify(message),
                },
            ],
        });
        console.log(`Message published to project topic ${topic}`);
    } catch (error) {
        console.error('Error publishing project message:', error);
    }
};

export {
    connectKafkaProjectProducerAsync,
    disconnectKafkaProjectProducerAsync,
    publishProjectMessageAsync,
};
