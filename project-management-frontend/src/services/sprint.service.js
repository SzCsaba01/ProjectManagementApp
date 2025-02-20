import api from '../config/axios.config';

//CREATE
export const createSprint = async (projectId, backlogId, sprintData) => {
    return (
        await api.post('/sprint/create-sprint-for-project', {
            projectId: projectId,
            backlogId: backlogId,
            sprintData: sprintData,
        })
    ).data;
};

//GET
export const getSprint = async (sprintId) => {
    return (
        await api.get('/sprint/get-sprint-by-id', {
            params: { sprintId: sprintId },
        })
    ).data;
};

export const getSprintsByIds = async (sprintIds) => {
    return (
        await api.put('/sprint/get-sprints-by-ids', {
            sprintIds: sprintIds,
        })
    ).data;
};

//UPDATE
export const updateSprint = async (newSprintData) => {
    return await api.put('/sprint/update-sprint', {
        newSprintData: newSprintData,
    });
};

export const finishSprint = async (sprintData) => {
    return await api.put('/sprint/finish-sprint', sprintData);
};

//DELETE
export const deleteSprint = async (sprintId, projectId) => {
    return await api.delete('/sprint/delete-sprint', {
        data: { sprintId: sprintId, projectId: projectId },
    });
};
