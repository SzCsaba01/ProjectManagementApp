import {
    sendUpdateToBacklogAsync,
    sendUpdateToSprintAsync,
} from '../../websocket.js';

class TaskController {
    constructor({ taskService }) {
        this.taskService = taskService;
    }

    async createTask(req, res, next) {
        try {
            const newTaskData = req.body;

            let host = undefined;

            if (req.files) {
                host = `${req.protocol}://${req.get('host')}`;
            }

            const createdTask = await this.taskService.createTaskAsync(
                newTaskData,
                host,
                req.files,
            );

            await res.status(200).json({
                createdTask: createdTask,
                message: 'Successfully created the task!',
            });
        } catch (error) {
            next(error);
        }
    }

    async getCurrentSprintTasksBySprintId(req, res, next) {
        try {
            const sprintId = req.query.sprintId;

            const tasks =
                await this.taskService.getCurrentSprintTasksBySprintIdAsync(
                    sprintId,
                );

            res.status(200).json(tasks);
        } catch (error) {
            next(error);
        }
    }

    async getTasksBySprintId(req, res, next) {
        try {
            const sprintId = req.query.sprintId;

            const tasks =
                await this.taskService.getTasksBySprintIdAsync(sprintId);
            res.status(200).json(tasks);
        } catch (error) {
            next(error);
        }
    }

    async getTasksByBacklogId(req, res, next) {
        try {
            const backlogId = req.query.backlogId;

            const result =
                await this.taskService.getTasksByBacklogIdAsync(backlogId);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async updateTask(req, res, next) {
        try {
            const { type, ...newTaskData } = req.body;

            let host = undefined;

            if (req.files) {
                host = `${req.protocol}://${req.get('host')}`;
            }

            const updatedTask = await this.taskService.updateTaskAsync(
                newTaskData,
                host,
                req.files,
            );

            const message = {
                type: 'UPDATE_TASK',
                task: updatedTask,
            };

            switch (type) {
                case 'SPRINT': {
                    sendUpdateToSprintAsync(updatedTask.sprintId, message);
                    break;
                }
                case 'BACKLOG': {
                    await sendUpdateToBacklogAsync(
                        updatedTask.backlogId,
                        message,
                    );
                    break;
                }
                default:
                    break;
            }

            res.status(200).json();
        } catch (error) {
            next(error);
        }
    }

    async updateTasksIndex(req, res, next) {
        try {
            const tasksToUpdate = req.body.tasks;
            const sprintId = req.body.sprintId;
            const backlogId = req.body.backlogId;
            const type = req.body.type;
            const draggedTaskId = req.body.draggedTaskId;

            const result = await this.taskService.updateTasksAsync(
                tasksToUpdate,
                sprintId,
            );

            const message = {
                type: 'UPDATE_TASKS',
                tasks: result,
                draggedTaskId: draggedTaskId,
            };

            switch (type) {
                case 'SPRINT': {
                    await sendUpdateToSprintAsync(sprintId, message);
                    break;
                }
                case 'BACKLOG': {
                    await sendUpdateToBacklogAsync(backlogId, message);
                    break;
                }
                default:
                    break;
            }
            res.status(200).json();
        } catch (error) {
            next(error);
        }
    }

    async deleteTask(req, res, next) {
        try {
            const taskId = req.body.taskId;
            await this.taskService.deleteTaskByIdAsync(taskId);
            res.status(200).json({
                message: 'Successfully deleted the task!',
            });
        } catch (error) {
            next(error);
        }
    }
}

export default TaskController;
