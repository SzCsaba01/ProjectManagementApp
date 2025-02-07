import {
    SET_CURRENT_PROJECT,
    CLEAR_CURRENT_PROJECT,
    SET_CURRENT_PROJECT_DETAILS,
    SET_CURRENT_SPRINT,
    CLEAR_CURRENT_PROJECT_DETAILS,
    CLEAR_CURRENT_SPRINT,
} from '../utils/constants.util';

export const setCurrentProjectSuccessAction = (projectId) => ({
    type: SET_CURRENT_PROJECT,
    payload: {
        projectId,
    },
});

export const setCurrentProjectDetailsAction = (
    projectId,
    backlogId,
    currentSprintId = null,
    finishedSprintIds = [],
) => ({
    type: SET_CURRENT_PROJECT_DETAILS,
    payload: {
        projectId,
        backlogId,
        currentSprintId,
        finishedSprintIds,
    },
});

export const setCurrentSprintAction = (sprintId) => ({
    type: SET_CURRENT_SPRINT,
    payload: {
        sprintId,
    },
});

export const clearCurrentProjectSuccessAction = () => ({
    type: CLEAR_CURRENT_PROJECT,
});

export const clearCurrentProjectDetailsAction = () => ({
    type: CLEAR_CURRENT_PROJECT_DETAILS,
});

export const clearCurrentSprintAction = (finishedSprintIds) => ({
    type: CLEAR_CURRENT_SPRINT,
    payload: {
        finishedSprintIds,
    },
});
