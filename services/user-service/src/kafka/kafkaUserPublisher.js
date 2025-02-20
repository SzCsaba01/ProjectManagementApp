import { publishUserMessageAsync } from './kafkaUserProducer.js';

const publishUserEventToTopic = async (topic, data) => {
    await publishUserMessageAsync(topic, data);
};

export default publishUserEventToTopic;
