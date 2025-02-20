import { Backlog } from '../models/index.js';

class BacklogRepository {
    async createBacklogAsync(backlog) {
        return await Backlog.create(backlog);
    }

    async getBacklogByBacklogId(backlogId) {
        return await Backlog.findOne({ _id: backlogId });
    }

    async deleteBacklogByIdAsync(backlogId) {
        return await Backlog.deleteOne({ _id: backlogId });
    }
}

export default BacklogRepository;
