import {
    SET_CURRENT_PROJECT,
    CLEAR_CURRENT_PROJECT,
    SET_CURRENT_PROJECT_DETAILS,
    SET_CURRENT_SPRINT,
    CLEAR_CURRENT_PROJECT_DETAILS,
    CLEAR_CURRENT_SPRINT,
} from '../utils/constants.util';

const initialState = {
    projectId: null,
    backlogId: null,
    currentSprintId: null,
    finishedSprintIds: null,
};

const projectReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_CURRENT_PROJECT:
            return {
                ...state,
                projectId: action.payload.projectId,
            };
        case SET_CURRENT_PROJECT_DETAILS:
            return {
                ...state,
                projectId: action.payload.projectId,
                backlogId: action.payload.backlogId,
                currentSprintId: action.payload.currentSprintId,
                finishedSprintIds: action.payload.finishedSprintIds,
            };
        case SET_CURRENT_SPRINT:
            return {
                ...state,
                currentSprintId: action.payload.currentSprintId,
            };
        case CLEAR_CURRENT_PROJECT:
            return {
                ...state,
                projectId: null,
            };
        case CLEAR_CURRENT_PROJECT_DETAILS: {
            return {
                ...state,
                projectId: null,
                backlogId: null,
                currentSprintId: null,
                finishedSprintIds: null,
            };
        }
        case CLEAR_CURRENT_SPRINT:
            return {
                ...state,
                currentSprintId: null,
                finishedSprintIds: action.payload.finishedSprintIds,
            };
        default:
            return state;
    }
};

export default projectReducer;
