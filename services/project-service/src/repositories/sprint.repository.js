import { Sprint } from '../models/index.js';

class SprintRepository {
    async createSprintAsync(sprint) {
        return await Sprint.create(sprint);
    }

    async getSprintBySprintIdAsync(sprintId) {
        return await Sprint.findOne({ _id: sprintId });
    }

    async getSptrintsBySprintIdsAsync(sprintIds) {
        return await Sprint.find({ _id: { $in: sprintIds } });
    }

    async updateSprintAsync(newSprintData) {
        const { _id, ...sprintWithoutId } = newSprintData;
        return await Sprint.findOneAndUpdate({ _id: _id }, sprintWithoutId);
    }

    async findAndUpdateSprintBySprintId(sprintId, newSprintData) {
        return await Sprint.findOneAndUpdate({ _id: sprintId }, newSprintData, {
            new: true,
            runValdiators: true,
        });
    }

    async deleteSprintBySprintIdAsync(sprintId) {
        return await Sprint.deleteOne({ _id: sprintId });
    }
}

export default SprintRepository;
