import { getRedisClient } from '../config/index.js';
import { SPRINT_PREFIX } from '../utils/index.js';

class SprintRedisRepository {
    constructor() {
        this.redisClient = getRedisClient();
    }

    async cacheSprintAsync(sprint) {
        const key = `${SPRINT_PREFIX}${sprint._id}`;
        const sprintData = this.#formatSprintData(sprint);
        await this.redisClient.hSet(key, sprintData);
    }

    async cacheSprintsAsync(sprints) {
        const multi = this.redisClient.multi();

        sprints.forEach((sprint) => {
            const key = `${SPRINT_PREFIX}${sprint._id}`;
            const sprintData = this.#formatSprintData(sprint);
            multi.hSet(key, sprintData);
        });

        await multi.exec();
    }

    async getSprintByIdAsync(sprintId) {
        const key = `${SPRINT_PREFIX}${sprintId}`;
        const sprintData = await this.redisClient.hGetAll(key);
        if (!sprintData || Object.keys(sprintData).length === 0) {
            return null;
        }

        return this.#parseSprintData(sprintData, sprintId);
    }

    async getSprintsByIdsAsync(sprintIds) {
        const multi = this.redisClient.multi();

        sprintIds.forEach((sprintId) => {
            const key = `${SPRINT_PREFIX}${sprintId}`;
            multi.hGetAll(key);
        });

        const sprintResults = await multi.exec();

        const mappedSprints = sprintResults
            .map((sprintData, index) => {
                if (!sprintData || Object.keys(sprintData).length === 0) {
                    return null;
                }
                return {
                    ...sprintData,
                    _id: sprintIds[index],
                    startDate: new Date(parseInt(sprintData.startDate, 10)),
                    plannedEndDate: new Date(
                        parseInt(sprintData.plannedEndDate, 10),
                    ),
                    endDate: sprintData.endDate
                        ? new Date(parseInt(sprintData.endDate))
                        : null,
                };
            })
            .filter(Boolean);
        return mappedSprints;
    }

    async updateSprintAsync(sprint) {
        const key = `${SPRINT_PREFIX}${sprint._id}`;
        if (this.redisClient.exists(key)) {
            const sprintData = this.#formatSprintData(sprint);
            await this.redisClient.hSet(key, sprintData);
        }
    }

    async deleteSprintByIdAsync(sprintId) {
        const key = `${SPRINT_PREFIX}${sprintId}`;

        await this.redisClient.del(key);
    }

    async deleteSprintsByIdsAsync(sprintIds) {
        if (!sprintIds.length) return;

        const multi = this.redisClient.multi();

        sprintIds.forEach((sprintId) => {
            const key = `${SPRINT_PREFIX}${sprintId}`;
            multi.del(key);
        });

        await multi.exec();
    }

    #formatSprintData(sprint) {
        const sprintData = {
            name: sprint.name,
            startDate: this.#formatDate(sprint.startDate),
            plannedEndDate: this.#formatDate(sprint.plannedEndDate),
            endDate: this.#formatDate(sprint.endDate),
            project: sprint.project.toString(),
        };

        return sprintData;
    }

    #parseSprintData(sprintData, sprintId) {
        return {
            ...sprintData,
            _id: sprintId,
            startDate: this.#parseDate(sprintData.startDate),
            plannedEndDate: this.#parseDate(sprintData.plannedEndDate),
            endDate: this.#parseDate(sprintData.endDate),
        };
    }

    #formatDate(date) {
        return date ? new Date(date).getTime() : '';
    }

    #parseDate(date) {
        return date !== '' ? new Date(parseInt(date, 10)) : null;
    }
}

export default SprintRedisRepository;
