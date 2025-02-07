import api from '../config/axios.config';

//CREATE
export const createSprint = async (projectId, backlogId, sprintData) => {
    return await api.post('/sprint/create-sprint-for-project', {
        projectId: projectId,
        backlogId: backlogId,
        sprintData: sprintData,
    });
};

//GET

//UPDATE
export const updateSprint = async (newSprintData) => {
    return await api.put('/sprint/update-sprint', {
        newSprintData: newSprintData,
    });
};

export const finishSprint = async (sprintId, projectId) => {
    return await api.put('/sprint/finish-sprint', {
        sprintId: sprintId,
        projectId: projectId,
    });
};

//DELETE
