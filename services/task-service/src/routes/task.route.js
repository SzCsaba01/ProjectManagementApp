import express from 'express';
import { formDataAndFileUploadHandlerMiddleware } from '../middlewares/index.js';

const router = express.Router();

const taskRoutes = (container) => {
    const taskController = container.resolve('taskController');

    //CREATE
    router.post(
        '/create-task',
        formDataAndFileUploadHandlerMiddleware('array', 'attachments', 5),
        (req, res, next) => taskController.createTask(req, res, next),
    );

    //GET
    router.get('/get-current-sprint-tasks-by-sprint-id', (req, res, next) =>
        taskController.getCurrentSprintTasksBySprintId(req, res, next),
    );
    router.get('/get-tasks-by-backlog-id', (req, res, next) =>
        taskController.getTasksByBacklogId(req, res, next),
    );

    //UPDATE
    router.put(
        '/update-task',
        formDataAndFileUploadHandlerMiddleware('array', 'files', 5),
        (req, res, next) => taskController.updateTask(req, res, next),
    );

    router.put('/update-tasks-index', (req, res, next) =>
        taskController.updateTasksIndex(req, res, next),
    );

    //DELETE
    router.delete('/delete-task', (req, res, next) =>
        taskController.deleteTask(req, res, next),
    );

    return router;
};

export default taskRoutes;
