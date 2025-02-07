import { publishEventToTopic } from '../kafka/index.js';

class ProjectService {
    constructor({ projectRepository, backlogRepository }) {
        this.projectRepository = projectRepository;
        this.backlogRepository = backlogRepository;
    }

    async createProjectAsync(newProjectData) {
        const project =
            await this.projectRepository.createProjectAsync(newProjectData);

        const backlog = await this.backlogRepository.createBacklogAsync({
            project: project._id,
        });

        project.backlog = backlog._id;
        await this.projectRepository.updateProjectAsync(project);

        const addUsersToProjectData = {
            userIds: [newProjectData.ownerId, ...newProjectData.userIds],
            projectId: project._id,
        };
        await publishEventToTopic(
            process.env.KAFKA_ADD_USERS_TO_PROJECT_TOPIC,
            addUsersToProjectData,
        );
    }

    async getAllProjectsAsync() {
        const projects = await this.projectRepository.getAllProjectsAsync();

        return projects;
    }

    async getProjectByProjectIdAsync(projectId) {
        const projectWithDetails =
            await this.projectRepository.getProjectByProjectIdAsync(projectId);

        const project = {
            name: projectWithDetails.name,
            backlogId: projectWithDetails.backlog,
            currentSprintId: projectWithDetails.currentSprint,
            finishedSprintIds: projectWithDetails.finishedSprints,
        };

        return project;
    }

    async getProjectsByMemberIdAsync(memberId) {
        const projects =
            await this.projectRepository.getProjectsByMemberIdAsync(memberId);

        return projects;
    }
    async getProjectsByOwnerIdAsync(ownerId) {
        const project =
            await this.projectRepository.getProjectsByOnwerIdAsync(ownerId);

        return project;
    }

    async updateProjectAsync(newProjectData) {
        const oldProject =
            await this.projectRepository.getProjectByProjectIdAsync(
                newProjectData._id,
            );

        const userIdsToBeRemoved = oldProject.userIds.filter(
            (userId) => !newProjectData.userIds.includes(userId),
        );

        const userIdsToBeAdded = newProjectData.userIds.filter(
            (userId) => !oldProject.userIds.includes(userId),
        );

        if (oldProject.ownerId != newProjectData.ownerId) {
            userIdsToBeRemoved.push(oldProject.ownerId);
            userIdsToBeAdded.push(newProjectData.ownerId);
        }

        await this.projectRepository.updateProjectAsync(newProjectData);

        if (userIdsToBeRemoved.length) {
            const removeUsersFromProjectData = {
                userIds: userIdsToBeRemoved,
                projectId: oldProject._id,
            };

            await publishEventToTopic(
                process.env.KAFKA_REMOVE_USERS_FROM_PROJECT_TOPIC,
                removeUsersFromProjectData,
            );
        }

        if (userIdsToBeAdded.length) {
            const addUsersToProjectData = {
                userIds: userIdsToBeAdded,
                projectId: oldProject._id,
            };

            await publishEventToTopic(
                process.env.KAFKA_ADD_USERS_TO_PROJECT_TOPIC,
                addUsersToProjectData,
            );
        }
    }

    async deleteProjectByProjectIdAsync(projectId) {
        const deletedProject =
            await this.projectRepository.deleteProjectByProjectIdAsync(
                projectId,
            );

        const removeUsersFromProjectData = {
            userIds: [ownerId, ...deletedProject.userIds],
            projectId: deletedProject._id,
        };

        await publishEventToTopic(
            process.env.KAFKA_REMOVE_USERS_FROM_PROJECT_TOPIC,
            removeUsersFromProjectData,
        );
    }
}

export default ProjectService;
