import {
    LOGIN_SUCCESS,
    UPDATE_USER_PROFILE_SUCCESS,
    LOGOUT,
} from '../utils/constants.util';

export const loginSuccessAction = (
    userId,
    username,
    email,
    firstName,
    lastName,
    avatar,
    roles,
    permissions,
) => ({
    type: LOGIN_SUCCESS,
    payload: {
        userId,
        username,
        email,
        firstName,
        lastName,
        avatar,
        roles,
        permissions,
    },
});

export const updateUserProfileSuccessAction = (
    firstName,
    lastName,
    avatar,
) => ({
    type: UPDATE_USER_PROFILE_SUCCESS,
    payload: {
        firstName,
        lastName,
        avatar,
    },
});

export const logoutAction = () => ({
    type: LOGOUT,
});
