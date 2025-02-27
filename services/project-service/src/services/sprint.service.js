import { publishProjectEventToTopicAsync } from '../kafka/index.js';

class SprintService {
    constructor({
        sprintRepository,
        sprintRedisRepository,
        projectRepository,
        projectRedisRepository,
    }) {
        this.sprintRepository = sprintRepository;
        this.sprintRedisRepository = sprintRedisRepository;
        this.projectRepository = projectRepository;
        this.projectRedisRepository = projectRedisRepository;
    }

    async createSprintForProjectAsync(projectId, backlogId, sprintData) {
        sprintData.project = projectId;

        const sprint =
            await this.sprintRepository.createSprintAsync(sprintData);
        await this.sprintRedisRepository.cacheSprintAsync(sprint);

        const redisProject =
            await this.projectRedisRepository.getProjectByIdAsync(projectId);

        const project = redisProject
            ? redisProject
            : await this.projectRepository.getProjectByProjectIdAsync(
                  projectId,
              );
        project.currentSprint = sprint._id;

        await this.projectRepository.updateProjectAsync(project);

        await this.projectRedisRepository.updateProjectAsync(project);

        await publishProjectEventToTopicAsync(
            process.env.KAFKA_START_SPRINT_TOPIC,
            {
                sprintId: sprint._id,
                backlogId: backlogId,
            },
        );
        return sprint._id;
    }

    async getSprintByIdAsync(sprintId) {
        const redisSprint =
            await this.sprintRedisRepository.getSprintByIdAsync(sprintId);
        if (redisSprint) {
            return redisSprint;
        }

        const sprint = await this.sprintRepository.getSprintByIdAsync(sprintId);
        await this.sprintRedisRepository.cacheSprintAsync(sprint);

        return sprint;
    }

    async getSprintsByIdsAsync(sprintIds) {
        const redisSprints =
            await this.sprintRedisRepository.getSprintsByIdsAsync(sprintIds);

        const missedSprintIds = sprintIds.filter((sprintId) => {
            const cachedSprint = redisSprints.find(
                (sprint) => sprint._id === sprintId,
            );

            return !cachedSprint;
        });
        if (redisSprints.length && !missedSprintIds.length) {
            return redisSprints;
        }

        const dbSprints =
            await this.sprintRepository.getSprintsByIdsAsync(missedSprintIds);

        const sprints = [...redisSprints, ...dbSprints];
        await this.sprintRedisRepository.cacheSprintsAsync(sprints);

        return sprints;
    }

    async updateSprintAsync(newSprintData) {
        try {
            await this.sprintRepository.updateSprintAsync(newSprintData);
            await this.sprintRedisRepository.updateSprintAsync(newSprintData);
        } catch (error) {
            console.log(error);
        }
    }

    async finishSprintAsync(sprintData) {
        const redisSprint = await this.sprintRepository.getSprintByIdAsync(
            sprintData.sprintId,
        );

        const sprint = redisSprint
            ? redisSprint
            : await this.sprintRepository.getSprintByIdAsync(
                  sprintData.sprintId,
              );

        const redisProject =
            await this.projectRedisRepository.getProjectByIdAsync(
                sprintData.projectId,
            );

        const project = redisProject
            ? redisProject
            : await this.projectRepository.getProjectByProjectIdAsync(
                  sprintData.projectId,
              );

        sprint.endDate = sprintData.endDate;

        project.currentSprint = null;

        project.finishedSprints.push(sprintData.sprintId);

        await this.projectRepository.updateProjectAsync(project);
        await this.projectRedisRepository.updateProjectAsync(project);

        await this.sprintRepository.updateSprintAsync(sprint);
        await this.sprintRedisRepository.updateSprintAsync(sprint);
        await publishProjectEventToTopicAsync(
            process.env.KAFKA_FINISH_SPRINT_TOPIC,
            {
                sprintId: sprintData.sprintId,
            },
        );
    }

    async deleteSprintAsync(sprintId, projectId) {
        try {
            const redisProject =
                await this.projectRedisRepository.getProjectByIdAsync(
                    projectId,
                );

            const project = redisProject
                ? redisProject
                : await this.projectRepository.getProjectByProjectIdAsync(
                      projectId,
                  );

            project.finishedSprints = project.finishedSprints.filter((id) => {
                const stringId = id.toString();
                return stringId !== sprintId;
            });

            await this.projectRepository.updateProjectAsync(project);
            await this.projectRedisRepository.updateProjectAsync(project);

            await this.sprintRepository.deleteSprintByIdAsync(sprintId);
            await this.projectRedisRepository.deleteSprintByIdAsync(sprintId);

            const messageData = {
                sprintId: sprintId,
            };

            await publishProjectEventToTopicAsync(
                process.env.KAFKA_DELETE_SPRINT_TOPIC,
                messageData,
            );
        } catch (error) {
            console.log(error);
        }
    }
}

export default SprintService;
