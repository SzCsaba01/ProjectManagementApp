import { publishMessageAsync } from './kafkaProducer.js';

const publishEventToTopic = async (topic, data) => {
    await publishMessageAsync(topic, data);
};

export default publishEventToTopic;
