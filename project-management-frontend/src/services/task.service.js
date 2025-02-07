import api from '../config/axios.config';
import { FORM_DATA_HEADERS } from '../utils/constants.util';

//CREATE
export const createTask = async (task) => {
    return (
        await api.post('/task/create-task', task, {
            headers: FORM_DATA_HEADERS,
        })
    ).data;
};

//GET
export const getCurrentSprintTasksBySprintId = async (sprintId) => {
    return (
        await api.get('/task/get-current-sprint-tasks-by-sprint-id', {
            params: { sprintId: sprintId },
        })
    ).data;
};

export const getTasksByBacklogId = async (backlogId) => {
    return (
        await api.get('/task/get-tasks-by-backlog-id', {
            params: { backlogId: backlogId },
        })
    ).data;
};

//UPDATE
export const updateTasksIndex = async (tasks, sprintId = undefined) => {
    return await api.put('/task/update-tasks-index', {
        tasks: tasks,
        sprintId: sprintId,
    });
};

export const updateTask = async (task) => {
    return (
        await api.put('/task/update-task', task, { headers: FORM_DATA_HEADERS })
    ).data;
};

//DELETE
