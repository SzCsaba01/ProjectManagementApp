import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { TaskStatus } from '../utils/index.js';

class TaskService {
    constructor({ taskRepository, taskRedisRepository }) {
        this.taskRepository = taskRepository;
        this.taskRedisRepository = taskRedisRepository;
    }

    async createTaskAsync(newTaskData, host, files) {
        if (
            newTaskData.storyPoints === 'null' ||
            newTaskData.storyPoints === ''
        ) {
            newTaskData.storyPoints = null;
        }
        const newTask = await this.taskRepository.createTaskAsync(newTaskData);
        if (!files) {
            return newTask;
        }

        newTask.attachments = this.#saveAttachmentsAsync(
            files,
            newTask.id,
            host,
        );

        const updatedTask = await this.taskRepository.updateTaskAsync(newTask);
        await this.taskRedisRepository.cacheTaskAsync(updatedTask);

        return updatedTask;
    }

    async getCurrentSprintTasksBySprintIdAsync(sprintId) {
        const redisTasks =
            await this.taskRedisRepository.getCurrentSprintTasksBySprintIdAsync(
                sprintId,
            );

        if (redisTasks.length) {
            return redisTasks;
        }

        const tasks =
            await this.taskRepository.getCurrentSprintTasksBySprintIdAsync(
                sprintId,
            );

        await this.taskRedisRepository.cacheTasksAsync(tasks);

        return tasks;
    }

    async getTasksBySprintIdAsync(sprintId) {
        const tasks =
            await this.taskRepository.getTasksBySprintIdAsync(sprintId);

        return tasks;
    }

    async getTasksByBacklogIdAsync(backlogId) {
        const redisTasks =
            await this.taskRedisRepository.getTasksByBacklogIdAsync(backlogId);

        if (redisTasks.length) {
            return redisTasks;
        }

        const tasks =
            await this.taskRepository.getTasksByBacklogIdAsync(backlogId);

        await this.taskRedisRepository.cacheTasksAsync(tasks);

        return tasks;
    }

    async updateTaskAsync(newTaskData, host, files) {
        if (
            newTaskData.storyPoints === 'null' ||
            newTaskData.storyPoints === ''
        ) {
            newTaskData.storyPoints = null;
        }
        this.#removeOldAttachments(
            newTaskData.attachments || [],
            newTaskData._id,
        );
        if (files.length) {
            if (!newTaskData.attachments) {
                newTaskData.attachments = [];
            }
            newTaskData.attachments.push(
                ...this.#saveAttachmentsAsync(files, newTaskData._id, host),
            );
        }
        newTaskData.updatedAt = Date.now();

        this.#checkTaskStatusByDate(newTaskData);

        const updatedTask =
            await this.taskRepository.updateTaskAsync(newTaskData);
        await this.taskRedisRepository.updateTaskAsync(updatedTask);

        return updatedTask;
    }

    async updateTasksAsync(newTasksData, sprintId = undefined) {
        if (sprintId) {
            newTasksData.forEach((task) => {
                this.#checkTaskStatusByStatus(task);
            });
        }
        await this.taskRepository.updateTasksAsync(newTasksData);
        await this.taskRedisRepository.updateTasksAsync(newTasksData);
        return newTasksData;
    }

    async startSprintAsync(sprintData) {
        const sprintId = sprintData.sprintId;
        const backlogId = sprintData.backlogId;

        const backlogTasks =
            await this.taskRepository.getTasksByBacklogIdAsync(backlogId);

        backlogTasks.forEach((task) => {
            task.sprintId = sprintId;
        });

        await this.taskRepository.updateTasksAsync(backlogTasks);
        await this.taskRedisRepository.updateTasksAsync(backlogTasks);
    }

    async removeUserFromTasksAsync(userId) {
        const userAssignedTasks =
            await this.taskRepository.getTasksByAssigneeIdAsync(userId);
        const userCreatedTasks =
            await this.taskRepository.getTasksByCreatorIdAsync(userId);

        userAssignedTasks.forEach((task) => {
            task.assigneeId = null;
        });
        userCreatedTasks.forEach((task) => {
            task.creatorId = null;
        });

        const allTasks = [...userAssignedTasks, ...userCreatedTasks];

        if (!allTasks.length) {
            return;
        }

        await this.taskRepository.updateTasksAsync(allTasks);
        await this.taskRedisRepository.updateTasksAsync(allTasks);
    }

    async finishSprintAsync(sprintData) {
        const sprintTasks =
            await this.taskRepository.getCurrentSprintTasksBySprintIdAsync(
                sprintData.sprintId,
            );

        sprintTasks.forEach((task) => {
            task.sprintEnded = true;
        });

        await this.taskRepository.updateTasksAsync(sprintTasks);
        await this.taskRedisRepository.deleteTasksAsync(sprintTasks);
    }

    async deleteTaskByIdAsync(taskId) {
        this.#removeAllAttachmentsByTaskId(taskId);
        const deletedTask =
            await this.taskRepository.deleteTaskByIdAsync(taskId);
        await this.taskRedisRepository.deleteTaskAsync(deletedTask);
    }

    async deleteTasksByBacklogIdAsync(backlogId) {
        const deletedTasks =
            await this.taskRepository.deleteTasksByBacklogIdAsync(backlogId);
        await this.taskRedisRepository.deleteTasksAsync(deletedTasks);
    }

    async deleteTasksBySprintIdAsync(sprintId) {
        const deletedTasks =
            await this.taskRepository.deleteTasksBySprintIdAsync(sprintId);
        await this.taskRedisRepository.deleteTasksAsync(deletedTasks);
    }

    #saveAttachmentsAsync(files, taskId, host) {
        const uploadRoot = path.join(process.cwd(), 'resources', 'attachments');
        const taskFolder = path.join(uploadRoot, taskId);

        if (!fs.existsSync(taskFolder)) {
            fs.mkdirSync(taskFolder, { recursive: true });
        }

        const attachments = [];
        files.forEach((file) => {
            const mimeType = file.mimetype;
            const extension = mimeType.split('/')[1];

            const fileName = `${Date.now()}-${uuidv4()}.${extension}`;
            const filePath = path.join(taskFolder, fileName);
            fs.writeFileSync(filePath, file.buffer);

            const attachmentUrl = `${host}/resources/attachments/${taskId}/${fileName}`;
            attachments.push(attachmentUrl);
        });
        return attachments;
    }

    #removeOldAttachments(attachments, taskId) {
        const uploadRoot = path.join(process.cwd(), 'resources', 'attachments');
        const taskFolder = path.join(uploadRoot, taskId);

        if (fs.existsSync(taskFolder)) {
            const filesInTaskFolder = fs.readdirSync(taskFolder);

            const attachmentFilesNames = attachments.map((url) => {
                return path.basename(url);
            });

            for (const file of filesInTaskFolder) {
                if (!attachmentFilesNames.includes(file)) {
                    const filePath = path.join(taskFolder, file);
                    fs.unlinkSync(filePath);
                }
            }
        }
    }

    #removeAllAttachmentsByTaskId(taskId) {
        const deleteRoot = path.join(process.cwd(), 'resources', 'attachments');
        const taskFolder = path.join(deleteRoot, taskId);
        if (fs.existsSync(taskFolder)) {
            fs.rmdirSync(taskFolder, { recursive: true });
        }
    }

    #checkTaskStatusByDate(task) {
        if (
            task.finishedAt &&
            task.status !== TaskStatus.Finished.description
        ) {
            task.status = TaskStatus.Finished.description;
        } else if (
            task.completedAt &&
            task.status !== TaskStatus.Completed.description
        ) {
            task.finishedAt = null;
            task.status = TaskStatus.Completed.description;
        } else if (
            task.startedAt &&
            task.status !== TaskStatus.InProgress.description
        ) {
            task.finishedAt = null;
            task.completedAt = null;
            task.status = TaskStatus.InProgress.description;
        } else if (
            task.plannedAt &&
            task.status !== TaskStatus.InPlanning.description
        ) {
            task.finishedAt = null;
            task.completedAt = null;
            task.startedAt = null;
            task.status = TaskStatus.InPlanning.description;
        } else {
            task.finishedAt = null;
            task.completedAt = null;
            task.startedAt = null;
            task.plannedAt = null;
            task.status = TaskStatus.NotStarted.description;
        }
    }

    #checkTaskStatusByStatus(task) {
        if (
            !task.finishedAt &&
            task.status === TaskStatus.Finished.description
        ) {
            task.finishedAt = Date.now();
        } else if (task.status === TaskStatus.Completed.description) {
            task.finishedAt = null;
            if (!task.completedAt) {
                task.completedAt = Date.now();
            }
        } else if (task.status === TaskStatus.InProgress.description) {
            task.finishedAt = null;
            task.completedAt = null;
            if (!task.startedAt) {
                task.startedAt = Date.now();
            }
        } else if (task.status === TaskStatus.InPlanning.description) {
            task.finishedAt = null;
            task.completedAt = null;
            task.startedAt = null;
            if (!task.plannedAt) {
                task.plannedAt = Date.now();
            }
        } else {
            task.finishedAt = null;
            task.completedAt = null;
            task.startedAt = null;
            task.plannedAt = null;
        }
    }
}

export default TaskService;
