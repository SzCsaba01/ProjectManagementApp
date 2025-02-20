import { Sprint } from '../models/index.js';

class SprintRepository {
    async createSprintAsync(sprint) {
        return await Sprint.create(sprint);
    }

    async getSprintByIdAsync(sprintId) {
        return await Sprint.findOne({ _id: sprintId });
    }

    async getSprintsByIdsAsync(sprintIds) {
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

    async deleteSprintByIdAsync(sprintId) {
        return await Sprint.deleteOne({ _id: sprintId });
    }

    async deleteSprintsByIdsAsync(sprintIds) {
        return await Sprint.deleteMany({ _id: { $in: sprintIds } });
    }
}

export default SprintRepository;
