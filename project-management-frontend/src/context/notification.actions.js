import { ADD_NOTIFICATION, CLEAR_NOTIFICATION } from '../utils/constants.util';

export const addNotification = (message, type) => ({
    type: ADD_NOTIFICATION,
    payload: { message, type },
});

export const clearNotification = () => ({
    type: CLEAR_NOTIFICATION,
});
