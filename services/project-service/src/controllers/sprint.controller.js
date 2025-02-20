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

            res.status(200).json({
                sprintId: sprintId,
                message: 'Successfully created a sprint!',
            });
        } catch (error) {
            next(error);
        }
    }

    async getSprintById(req, res, next) {
        try {
            const sprintId = req.query.sprintId;

            const sprint =
                await this.sprintService.getSprintByIdAsync(sprintId);
            res.status(200).json(sprint);
        } catch (error) {
            next(error);
        }
    }

    async getSprintsByIds(req, res, next) {
        try {
            const sprintIds = req.body.sprintIds;

            const sprints =
                await this.sprintService.getSprintsByIdsAsync(sprintIds);

            res.status(200).json(sprints);
        } catch (error) {
            next(error);
        }
    }

    async updateSprint(req, res, next) {
        try {
            const newSprintData = req.body.newSprintData;

            await this.sprintService.updateSprintAsync(newSprintData);

            res.status(200).json({
                message: 'Successfully updated the sprint!',
            });
        } catch (error) {
            next(error);
        }
    }

    async finishSprint(req, res, next) {
        try {
            const sprintData = req.body;

            await this.sprintService.finishSprintAsync(sprintData);
            res.status(200).json({});
        } catch (error) {
            next(error);
        }
    }

    async deleteSprint(req, res, next) {
        try {
            const sprintId = req.body.sprintId;
            const projectId = req.body.projectId;

            await this.sprintService.deleteSprintAsync(sprintId, projectId);
            res.status(200).json({
                message: 'Successfully deleted the sprint!',
            });
        } catch (error) {
            next(error);
        }
    }
}

export default SprintController;
