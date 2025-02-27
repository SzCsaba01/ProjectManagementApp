import { publishProjectEventToTopicAsync } from '../kafka/index.js';

class ProjectService {
    constructor({
        projectRepository,
        projectRedisRepository,
        backlogRepository,
        sprintRepository,
    }) {
        this.projectRepository = projectRepository;
        this.projectRedisRepository = projectRedisRepository;
        this.backlogRepository = backlogRepository;
        this.sprintRepository = sprintRepository;
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
        await publishProjectEventToTopicAsync(
            process.env.KAFKA_ADD_USERS_TO_PROJECT_TOPIC,
            addUsersToProjectData,
        );
    }

    async getAllProjectsAsync() {
        const projects = await this.projectRepository.getAllProjectsAsync();

        return projects;
    }

    async getProjectByProjectIdAsync(projectId) {
        const redisProjectData =
            await this.projectRedisRepository.getProjectByIdAsync(projectId);

        if (redisProjectData) {
            const project = {
                name: redisProjectData.name,
                backlogId: redisProjectData.backlog,
                currentSprintId: redisProjectData.currentSprint,
                finishedSprintIds: redisProjectData.finishedSprints,
            };

            return project;
        }

        const projectData =
            await this.projectRepository.getProjectByProjectIdAsync(projectId);

        await this.projectRedisRepository.cacheProjectAsync(projectData);

        if (projectData) {
            const project = {
                name: projectData.name,
                backlogId: projectData.backlog,
                currentSprintId: projectData.currentSprint,
                finishedSprintIds: projectData.finishedSprints,
            };

            return project;
        }
    }

    async getProjectsByMemberIdAsync(memberId) {
        const projects =
            await this.projectRepository.getProjectsByMemberIdAsync(memberId);

        return projects;
    }

    async getProjectsByOwnerIdAsync(ownerId) {
        const projects =
            await this.projectRepository.getProjectsByOwnerIdAsync(ownerId);

        return projects;
    }

    async updateProjectAsync(newProjectData) {
        const redisProject =
            await this.projectRedisRepository.getProjectByIdAsync(
                newProjectData._id,
            );
        const oldProject = redisProject
            ? redisProject
            : await this.projectRepository.getProjectByProjectIdAsync(
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
        await this.projectRedisRepository.updateProjectAsync(newProjectData);

        if (userIdsToBeRemoved.length) {
            const removeUsersFromProjectData = {
                userIds: userIdsToBeRemoved,
                projectId: oldProject._id,
            };

            await publishProjectEventToTopicAsync(
                process.env.KAFKA_REMOVE_USERS_FROM_PROJECT_TOPIC,
                removeUsersFromProjectData,
            );
        }

        if (userIdsToBeAdded.length) {
            const addUsersToProjectData = {
                userIds: userIdsToBeAdded,
                projectId: oldProject._id,
            };

            await publishProjectEventToTopicAsync(
                process.env.KAFKA_ADD_USERS_TO_PROJECT_TOPIC,
                addUsersToProjectData,
            );
        }
    }

    async removeUserFromProjectsAsync(userId) {
        const userMemberProjects =
            await this.projectRepository.getProjectsByMemberIdAsync(userId);
        const userOwnerProjects =
            await this.projectRepository.getProjectsByOwnerIdAsync(userId);

        userMemberProjects.forEach((project) => {
            project.userIds = project.userIds.filter((id) => userId !== id);
        });

        if (userOwnerProjects.length > 0) {
            const otherOwnerId =
                await this.projectRepository.getOtherOwnerIdAsync(userId);

            userOwnerProjects.forEach((project) => {
                project.ownerId = otherOwnerId;
            });

            await this.projectRepository.updateProjectsAsync(userOwnerProjects);
            await this.projectRedisRepository.updateProjectsAsync(
                userOwnerProjects,
            );
        }

        if (userMemberProjects.length > 0) {
            await this.projectRepository.updateProjectsAsync(
                userMemberProjects,
            );
            await this.projectRedisRepository.updateProjectsAsync(
                userMemberProjects,
            );
        }
    }

    async deleteProjectByProjectIdAsync(projectId) {
        await this.projectRedisRepository.deleteProjectByProjectIdAsync(
            projectId,
        );
        const deletedProject =
            await this.projectRepository.deleteProjectByProjectIdAsync(
                projectId,
            );

        const removeUsersFromProjectData = {
            userIds: [deletedProject.ownerId, ...deletedProject.userIds],
            projectId: deletedProject._id,
        };

        await publishProjectEventToTopicAsync(
            process.env.KAFKA_REMOVE_USERS_FROM_PROJECT_TOPIC,
            removeUsersFromProjectData,
        );

        const removeTasksByBacklogIdData = {
            backlogId: deletedProject.backlog,
        };

        await publishProjectEventToTopicAsync(
            process.env.KAFKA_DELETE_PROJECT_TOPIC,
            removeTasksByBacklogIdData,
        );

        await this.backlogRepository.deleteBacklogByIdAsync(
            deletedProject.backlog,
        );
        await this.sprintRepository.deleteSprintsByIdsAsync([
            ...deletedProject.finishedSprints,
            deletedProject.currentSprint,
        ]);
    }
}

export default ProjectService;
