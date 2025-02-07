class ProjectController {
    constructor({ projectService }) {
        this.projectService = projectService;
    }

    async createProject(req, res, next) {
        try {
            const newProjectData = {
                name: req.body.projectName,
                ownerId: req.body.manager,
                userIds: req.body.teamMembers,
            };

            await this.projectService.createProjectAsync(newProjectData);

            res.status(200).json({
                message: 'Successfully created the project!',
            });
        } catch (error) {
            next(error);
        }
    }

    async getAllProjects(_req, res, next) {
        try {
            const result = await this.projectService.getAllProjectsAsync();
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getProjectByProjectId(req, res, next) {
        try {
            const projectId = req.query.projectId;

            const result =
                await this.projectService.getProjectByProjectIdAsync(projectId);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getProjectsByMemberId(req, res, next) {
        try {
            const memberId = req.query.memberId;

            const result =
                await this.projectService.getProjectsByMemberIdAsync(memberId);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getProjectsByOwnerId(req, res, next) {
        try {
            const ownerId = req.query.ownerId;

            const result =
                await this.projectService.getProjectsByOwnerIdAsync(ownerId);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async updateProject(req, res, next) {
        try {
            const newProjectData = {
                _id: req.body.projectId,
                name: req.body.projectName,
                ownerId: req.body.manager,
                userIds: req.body.teamMembers,
            };

            await this.projectService.updateProjectAsync(newProjectData);

            res.status(200).json({
                message: 'Successfully updated the project!',
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteProject(req, res, next) {
        try {
            const projectId = req.query.projectId;

            await this.projectService.deleteProjectByProjectIdAsync(projectId);

            res.status(200).json({
                message: 'Successfully deleted the project!',
            });
        } catch (error) {
            next(error);
        }
    }
}

export default ProjectController;
