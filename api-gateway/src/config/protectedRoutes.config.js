import {
    ACTIONS,
    ADMIN_ROLE,
    MANAGER_ROLE,
    USER_ROLE,
    RESOURCES,
} from '../utils/constants.js';

const protectedRoutes = {
    //user-service

    //GET
    '/get-users-paginated': {
        permissions: [{ resource: RESOURCES.USER, action: ACTIONS.MANAGE }],
    },
    '/get-managers': {
        permissions: [{ resource: RESOURCES.USER, action: ACTIONS.MANAGE }],
    },
    '/get-all-users-for-project': {
        roles: [ADMIN_ROLE, MANAGER_ROLE],
    },

    //project-service

    //CREATE
    '/create-project': {
        permissions: [{ resource: RESOURCES.PROJECT, action: ACTIONS.MANAGE }],
    },

    //GET
    '/get-all-projects': {
        roles: [ADMIN_ROLE],
    },
    '/get-project-by-project-id': {
        permissions: [
            { resource: RESOURCES.PROJECT, action: ACTIONS.VIEW },
            { resource: RESOURCES.PROJECT, action: ACTIONS.MANAGE },
        ],
    },
    '/get-projects-by-owner-id': {
        permissions: [
            { resource: RESOURCES.PROJECT, action: ACTIONS.VIEW },
            { resource: RESOURCES.PROJECT, action: ACTIONS.MANAGE },
        ],
    },

    //UPDATE
    '/update-project': {
        permissions: [{ resource: RESOURCES.PROJECT, action: ACTIONS.MANAGE }],
    },

    //DELETE
    '/delete-project': {
        permissions: [{ resource: RESOURCES.PROJECT, action: ACTIONS.MANAGE }],
    },
};

export default protectedRoutes;
