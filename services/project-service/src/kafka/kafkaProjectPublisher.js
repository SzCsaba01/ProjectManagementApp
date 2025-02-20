import { publishProjectMessageAsync } from './kafkaProjectProducer.js';

const publishProjectEventToTopicAsync = async (topic, data) => {
    await publishProjectMessageAsync(topic, data);
};

export default publishProjectEventToTopicAsync;
