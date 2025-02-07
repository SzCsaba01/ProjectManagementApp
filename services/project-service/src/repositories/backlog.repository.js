import { Backlog } from '../models/index.js';

class BacklogRepository {
    async createBacklogAsync(backlog) {
        return await Backlog.create(backlog);
    }

    async getBacklogByBacklogId(backlogId) {
        return await Backlog.findOne({ _id: backlogId });
    }

    async findAndUpdateBacklog(newBacklogData) {
        const { _id, ...backlogWithoutId } = newBacklogData;
        return await Backlog.findOneAndUpdate({ _id: _id }, newBacklogData, {
            new: true,
            runValidators: true,
        });
    }

    async deleteBacklogByBacklogIdAsync(backlogId) {
        return await Backlog.deleteOne({ _id: backlogId });
    }
}

export default BacklogRepository;
