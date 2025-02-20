import api from '../config/axios.config';
import ChangePasswordRequestDTO from '../dtos/user/change-password-request.dto';
import RegisterRequestDTO from '../dtos/user/register-request.dto';

//CREATE
export const register = async (
    firstName,
    lastName,
    username,
    email,
    password,
    repeatPassword,
) => {
    const registerRequest = new RegisterRequestDTO(
        firstName,
        lastName,
        username,
        email,
        password,
        repeatPassword,
    );
    await api.post('/user/register', registerRequest);
};

//GET
export const getUserData = async () => {
    return (await api.get('/user/user-data')).data;
};

export const getManagers = async () => {
    return (await api.get('/user/get-managers')).data;
};

export const getAllUsersForProject = async () => {
    return (await api.get('/user/get-all-users-for-project')).data;
};

export const getUsersPaginated = async (search, page, numberOfUsers) => {
    return (
        await api.get('/user/get-users-paginated', {
            params: {
                search: search,
                page: page,
                numberOfUsers: numberOfUsers,
            },
        })
    ).data;
};

export const verifyPasswordToken = async (verifyPasswordToken) => {
    await api.get('/user/verify-password', {
        params: {
            token: verifyPasswordToken,
        },
    });
};

export const getUsersByProject = async (projectId) => {
    return (
        await api.get('/user/get-users-by-project-id', {
            params: {
                projectId: projectId,
            },
        })
    ).data;
};

//UPDATE
export const forgotPassword = async (email) => {
    await api.put('/user/send-forgot-password-email', { email });
};

export const changePassword = async (
    forgotPasswordToken,
    newPassword,
    repeatNewPassword,
) => {
    const changePasswordRequest = new ChangePasswordRequestDTO(
        forgotPasswordToken,
        newPassword,
        repeatNewPassword,
    );

    await api.put('/user/change-password', changePasswordRequest);
};

export const verifyEmail = async (registrationToken) => {
    await api.get('/user/verify-email', {
        params: { token: registrationToken },
    });
};

export const setSelectedProject = async (projectId, userId) => {
    await api.put('/user/set-selected-project', {
        projectId: projectId,
        userId: userId,
    });
};

//DELETE
export const deleteUser = async (userId) => {
    await api.delete('/user/delete-user', { data: { userId: userId } });
};
