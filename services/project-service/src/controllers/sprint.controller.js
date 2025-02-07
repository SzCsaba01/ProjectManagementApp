class SprintController {
    constructor({ sprintService }) {
        this.sprintService = sprintService;
    }

    async createSprintForProject(req, res, next) {
        try {
            const projectId = req.body.projectId;
            const backlogId = req.body.backlogId;
            const sprintData = req.body.sprintData;

            const sprintId =
                await this.sprintService.createSprintForProjectAsync(
                    projectId,
                    backlogId,
                    sprintData,
                );

            res.status(200).json({ sprintId: sprintId });
        } catch (error) {
            next(error);
        }
    }

    async updateSprint(req, res, next) {
        try {
            const newSprintData = req.body.newSprintData;

            await this.sprintService.updateSprintAsync(newSprintData);

            res.status(200).json({});
        } catch (error) {
            next(error);
        }
    }

    async finishSprint(req, res, next) {
        try {
            const sprintId = req.body.sprintId;
            const projectId = req.body.projectId;

            await this.sprintService.finishSprintAsync(sprintId, projectId);
            res.status(200).json({});
        } catch (error) {
            next(error);
        }
    }
}

export default SprintController;
