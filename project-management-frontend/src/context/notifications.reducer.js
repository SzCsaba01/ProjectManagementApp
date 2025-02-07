import { ADD_NOTIFICATION, CLEAR_NOTIFICATION } from '../utils/constants.util';

const initialState = [];

const notificationReducer = (state = initialState, action) => {
    switch (action.type) {
        case ADD_NOTIFICATION:
            return action.payload;
        case CLEAR_NOTIFICATION:
            return null;
        default:
            return state;
    }
};

export default notificationReducer;
