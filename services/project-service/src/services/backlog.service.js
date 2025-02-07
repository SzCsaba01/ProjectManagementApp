class BacklogService {
    constructor({ backlogRepository }) {
        this.backlogRepository = backlogRepository;
    }

    async getBacklogByIdAsync(backlogId) {
        return await this.backlogRepository.getBacklogByBacklogId(backlogId);
    }
}

export default BacklogService;
