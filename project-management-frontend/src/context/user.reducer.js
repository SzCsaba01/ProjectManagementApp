import {
    LOGIN_SUCCESS,
    LOGOUT,
    UPDATE_USER_PROFILE_SUCCESS,
} from '../utils/constants.util';

const initialState = {
    userId: null,
    username: null,
    email: null,
    firstName: null,
    lastName: null,
    avatar: null,
    isAuthenticated: false,
    roles: null,
    permissions: null,
};

const userReducer = (state = initialState, action) => {
    switch (action.type) {
        case LOGIN_SUCCESS:
            return {
                ...state,
                userId: action.payload.userId,
                username: action.payload.username,
                email: action.payload.email,
                firstName: action.payload.firstName,
                lastName: action.payload.lastName,
                avatar: action.payload.avatar,
                isAuthenticated: true,
                roles: action.payload.roles,
                permissions: action.payload.permissions,
            };
        case UPDATE_USER_PROFILE_SUCCESS:
            return {
                ...state,
                firstName: action.payload.firstName,
                lastName: action.payload.lastName,
                avatar: action.payload.avatar,
            };
        case LOGOUT:
            return {
                ...state,
                userId: null,
                username: null,
                email: null,
                firstName: null,
                lastName: null,
                avatar: null,
                isAuthenticated: false,
                roles: null,
                permissions: null,
            };
        default:
            return state;
    }
};

export default userReducer;
