import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { BacklogStatus, TaskStatus } from '../utils/index.js';

class TaskService {
    constructor({ taskRepository }) {
        this.taskRepository = taskRepository;
    }

    async createTaskAsync(newTaskData, host, files) {
        const newTask = await this.taskRepository.createTaskAsync(newTaskData);

        if (!files) {
            return newTask;
        }

        newTask.attachments = await this.saveAttachmentsAsync(
            files,
            newTask.id,
            host,
        );

        return await this.taskRepository.updateTaskAsync(newTask);
    }

    async getCurrentSprintTasksBySprintIdAsync(sprintId) {
        const tasks =
            await this.taskRepository.getCurrentSprintTasksBySprintIdAsync(
                sprintId,
            );

        return tasks;
    }

    async getTasksByBacklogIdAsync(backlogId) {
        const tasks =
            await this.taskRepository.getTasksByBacklogIdAsync(backlogId);

        return tasks;
    }

    async updateTaskAsync(newTaskData, host, files) {
        this.removeOldAttachments(
            newTaskData.attachments || [],
            newTaskData._id,
        );
        if (files) {
            if (!newTaskData.attachments) {
                newTaskData.attachments = [];
            }
            newTaskData.attachments.push(
                ...(await this.saveAttachmentsAsync(
                    files,
                    newTaskData._id,
                    host,
                )),
            );
        }
        newTaskData.updatedAt = Date.now();

        this.#checkTaskStatusByDate(newTaskData);

        return await this.taskRepository.updateTaskAsync(newTaskData);
    }

    async updateTasksAsync(newTasksData, sprintId = undefined) {
        if (sprintId) {
            newTasksData.forEach((task) => {
                this.#checkBacklogStatus(task);
                this.#checkTaskStatusByStatus(task);
            });
        }
        await this.taskRepository.updateTasksAsync(newTasksData);
    }

    async startSprintAsync(sprintData) {
        const sprintId = sprintData.sprintId;
        const backlogId = sprintData.backlogId;

        const currentSprintTasks =
            await this.taskRepository.getCurrentSprintTasksByBacklogIdAsync(
                backlogId,
            );

        currentSprintTasks.forEach((task) => {
            task.sprintId = sprintId;
        });

        await this.taskRepository.updateTasksAsync(currentSprintTasks);
    }

    async finishSprintAsync(sprintData) {
        const finishedTasks =
            await this.taskRepository.getFinishedTasksBySprintId(
                sprintData.sprintId,
            );

        finishedTasks.forEach((task) => {
            task.backlogId = null;
        });

        await this.taskRepository.updateTasksAsync(finishedTasks);
    }

    async saveAttachmentsAsync(files, taskId, host) {
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

    async removeOldAttachments(attachments, taskId) {
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

    #checkBacklogStatus(task) {
        if (
            task.backlogStatus === BacklogStatus.CurrentSprint.description &&
            !task.sprintId
        ) {
            task.sprintId = sprintId;
        } else if (
            BacklogStatus.CurrentSprint.description !== task.backlogStatus
        ) {
            task.sprintId = null;
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
            task.status = TaskStatus.Completed.description;
        } else if (
            task.startedAt &&
            task.status !== TaskStatus.InProgress.description
        ) {
            task.status = TaskStatus.InProgress.description;
        } else if (
            task.plannedAt &&
            task.status !== TaskStatus.InPlanning.description
        ) {
            task.status = TaskStatus.InPlanning.description;
        }
    }

    #checkTaskStatusByStatus(task) {
        if (
            !task.finishedAt &&
            task.status === TaskStatus.Finished.description
        ) {
            task.finishedAt = Date.now();
        } else if (
            !task.completedAt &&
            task.status === TaskStatus.Completed.description
        ) {
            task.completedAt = Date.now();
            task.finishedAt = null;
        } else if (
            !task.startedAt &&
            task.status === TaskStatus.InProgress.description
        ) {
            task.finishedAt = null;
            task.completedAt = null;
            task.startedAt = Date.now();
        } else if (
            !task.plannedAt &&
            task.status === TaskStatus.InPlanning.description
        ) {
            task.finishedAt = null;
            task.completedAt = null;
            task.startedAt = null;
            task.plannedAt = Date.now();
        }
    }
}

export default TaskService;
