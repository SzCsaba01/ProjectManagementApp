import { publishMessageAsync } from './kafkaProducer.js';

const publishEventToTopicAsync = async (topic, data) => {
    await publishMessageAsync(topic, data);
};

export default publishEventToTopicAsync;
