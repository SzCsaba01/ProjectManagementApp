import api from '../config/axios.config';

//CREATE
export const createProject = async (project) => {
    await api.post('/project/create-project', project);
};

//GET
export const getAllProjects = async () => {
    return (await api.get('/project/get-all-projects')).data;
};

export const getProjectByProjectId = async (projectId) => {
    return (
        await api.get('/project/get-project-by-project-id', {
            params: {
                projectId: projectId,
            },
        })
    ).data;
};

export const getProjectsByMemberId = async (memberId) => {
    return (
        await api.get('/project/get-projects-by-member-id', {
            params: {
                memberId: memberId,
            },
        })
    ).data;
};

export const getProjectsByOwnerId = async (ownerId) => {
    return (
        await api.get('/project/get-projects-by-owner-id', {
            params: {
                ownerId: ownerId,
            },
        })
    ).data;
};

export const getProjectsByMemberOrOwnerId = async (userId) => {
    return (
        await api.get('/project/get-projects-by-member-or-owner-id', {
            params: { userId: userId },
        })
    ).data;
};

//UPDATE
export const updateProject = async (project) => {
    return await api.put('/project/update-project', project);
};

//DELETE
export const deleteProject = async (projectId) => {
    return await api.delete('/project/delete-project', {
        params: { projectId: projectId },
    });
};
