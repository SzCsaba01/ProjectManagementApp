import { getRedisClient } from '../config/index.js';
import BacklogStatus from '../utils/backlogStatus.enum.js';
import { TASK_INDEX_NAME, TASK_PREFIX } from '../utils/constants.js';

class TaskRedisRepository {
    constructor() {
        this.redisClient = getRedisClient();
    }

    async cacheTaskAsync(task) {
        const key = `${TASK_PREFIX}${task._id}`;

        const taskData = this.#formatTaskData(task);
        await this.redisClient.hSet(key, taskData);
    }

    async cacheTasksAsync(tasks) {
        const multi = this.redisClient.multi();

        tasks.forEach((task) => {
            const key = `${TASK_PREFIX}${task._id}`;

            const taskData = this.#formatTaskData(task);

            multi.hSet(key, taskData);
        });

        await multi.exec();
    }

    async getCurrentSprintTasksBySprintIdAsync(sprintId) {
        const query = `@sprintId:{${sprintId}} @backlogStatus:{${BacklogStatus.CurrentSprint.description}}`;
        const result = await this.#searchTasksAsync(query);
        return result;
    }

    async getTasksByBacklogIdAsync(backlogId) {
        const query = `@backlogId:{${backlogId}} @sprintEnded:[0 0]`;
        const result = await this.#searchTasksAsync(query);
        return result;
    }

    async updateTasksAsync(tasks) {
        const multi = this.redisClient.multi();

        tasks.forEach((task) => {
            const key = `${TASK_PREFIX}${task._id}`;
            if (this.redisClient.exists(key)) {
                const taskData = this.#formatTaskData(task);
                multi.hSet(key, taskData);
            }
        });

        await multi.exec();
    }

    async updateTaskAsync(task) {
        const key = `${TASK_PREFIX}${task._id}`;
        if (this.redisClient.exists(key)) {
            const taskData = this.#formatTaskData(task);
            await this.redisClient.hSet(key, taskData);
        }
    }

    async deleteTasksAsync(tasks) {
        const multi = this.redisClient.multi();

        tasks.forEach((task) => {
            const key = `${TASK_PREFIX}${task._id}`;
            multi.del(key);
        });

        await multi.exec();
    }

    async deleteTaskAsync(task) {
        const key = `${TASK_PREFIX}${task._id}`;
        await this.redisClient.del(key);
    }

    async #searchTasksAsync(query) {
        const result = await this.redisClient.ft.search(TASK_INDEX_NAME, query);
        return result.documents.map((doc) => ({
            ...doc.value,
            _id: doc.id.replace(TASK_PREFIX, ''),
            attachments: doc.value.attachments.split(','),
            createdAt: this.#parseDate(doc.value.createdAt),
            plannedAt: this.#parseDate(doc.value.plannedAt),
            startedAt: this.#parseDate(doc.value.startedAt),
            completedAt: this.#parseDate(doc.value.completedAt),
            finishedAt: this.#parseDate(doc.value.finishedAt),
            updatedAt: this.#parseDate(doc.value.updatedAt),
            assigneeId:
                doc.value.assigneeId !== '' ? doc.value.assigneeId : null,
            creatorId: doc.value.creatorId !== '' ? doc.value.creatorId : null,
            storyPoints:
                doc.value.storyPoints !== '' ? doc.value.storyPoints : null,
            sprintId: doc.value.sprintId !== '' ? doc.value.sprintId : null,
            sprintEnded: doc.value.sprintEnded === 1 ? true : false,
        }));
    }

    #formatTaskData(task) {
        const taskData = {
            name: task.name,
            description: task.description,
            attachments: task.attachments.join(','),
            priority: task.priority,
            category: task.category,
            backlogStatus: task.backlogStatus,
            index: task.index,
            assigneeId: task.assigneeId ? task.assigneeId : '',
            creatorId: task.creatorId ? task.creatorId : '',
            status: task.status,
            storyPoints: task.storyPoints ? task.storyPoints : '',
            backlogId: task.backlogId,
            sprintId: task.sprintId ? task.sprintId : '',
            createdAt: this.#formatDate(task.createdAt),
            plannedAt: this.#formatDate(task.plannedAt),
            startedAt: this.#formatDate(task.startedAt),
            completedAt: this.#formatDate(task.completedAt),
            finishedAt: this.#formatDate(task.finishedAt),
            sprintEnded: task.sprintEnded ? 1 : 0,
            updatedAt: this.#formatDate(task.updatedAt),
        };
        return taskData;
    }

    #formatDate(date) {
        return date ? new Date(date).getTime() : '';
    }

    #parseDate(date) {
        return date !== '' ? new Date(parseInt(date, 10)) : null;
    }
}

export default TaskRedisRepository;
