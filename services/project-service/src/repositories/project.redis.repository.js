import { getRedisClient } from '../config/index.js';
import { PROJECT_PREFIX } from '../utils/index.js';

class ProjectRedisRepository {
    constructor() {
        this.redisClient = getRedisClient();
    }

    async cacheProjectAsync(project) {
        const key = `${PROJECT_PREFIX}${project._id}`;
        const projectData = {
            name: project.name,
            ownerId: project.ownerId,
            userIds: project.userIds.join(','),
            currentSprint: project.currentSprint
                ? project.currentSprint.toString()
                : '',
            finishedSprints: project.finishedSprints.join(','),
            backlog: project.backlog.toString(),
        };

        await this.redisClient.hSet(key, projectData);
    }

    async getProjectByIdAsync(projectId) {
        const key = `${PROJECT_PREFIX}${projectId}`;
        const projectData = await this.redisClient.hGetAll(key);
        if (!projectData || Object.keys(projectData).length === 0) {
            return null;
        }
        return {
            _id: projectId,
            ...projectData,
            userIds: projectData.userIds ? projectData.userIds.split(',') : [],
            currentSprint:
                projectData.currentSprint && projectData.currentSprint !== ''
                    ? projectData.currentSprint
                    : null,
            finishedSprints: projectData.finishedSprints
                ? projectData.finishedSprints.split(',')
                : [],
        };
    }

    async updateProjectAsync(project) {
        const key = `${PROJECT_PREFIX}${project._id}`;
        if (this.redisClient.exists(key)) {
            const projectData = {
                name: project.name,
                ownerId: project.ownerId,
                userIds: project.userIds.join(','),
                currentSprint: project.currentSprint
                    ? project.currentSprint.toString()
                    : '',
                finishedSprints: project.finishedSprints.join(','),
                backlog: project.backlog.toString(),
            };
            await this.redisClient.hSet(key, projectData);
        }
    }

    async updateProjectsAsync(projects) {
        const multi = this.redisClient.multi();
        projects.forEach((project) => {
            const key = `${PROJECT_PREFIX}${project._id}`;
            if (this.redisClient.exists(key)) {
                const projectData = {
                    name: project.name,
                    ownerId: project.ownerId,
                    userIds: project.userIds.join(','),
                    currentSprint: project.currentSprint
                        ? project.currentSprint
                        : '',
                    finishedSprints: project.finishedSprints.join(','),
                    backlog: project.backlog.toString(),
                };
                multi.hSet(key, projectData);
            }
        });

        await multi.exec();
    }

    async deleteProjectByIdAsync(projectId) {
        const key = `${PROJECT_PREFIX}${projectId}`;

        await this.redisClient.del(key);
    }
}

export default ProjectRedisRepository;
