export const PROJECT_RESOURCE = 'project';
export const TASK_RESOURCE = 'task';
export const USER_RESOURCE = 'user';
export const SPRINT_RESOURCE = 'sprint';
export const ROLE_RESOURCE = 'role';

export const CREATE_ACTION = 'create';
export const VIEW_ACTION = 'view';
export const UPDATE_ACTION = 'update';
export const DELETE_ACTION = 'delete';
export const MANAGE_ACTION = 'manage';

export const ADMIN_ROLE = 'Admin';
export const MANAGER_ROLE = 'Manager';
export const USER_ROLE = 'User';

//user action types
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const UPDATE_USER_PROFILE_SUCCESS = 'UPDATE_USER_PROFILE_SUCCESS';
export const LOGOUT = 'LOGOUT';

//notification action types
export const ADD_NOTIFICATION = 'ADD_NOTIFICATION';
export const CLEAR_NOTIFICATION = 'CLEAR_NOTIFICATION';

//project action types
export const SET_CURRENT_PROJECT = 'SET_CURRENT_PROJECT';
export const SET_CURRENT_PROJECT_DETAILS = 'SET_CURRENT_PROJECT_DETAILS';
export const SET_CURRENT_SPRINT = 'SET_CURRENT_SPRINT';
export const CLEAR_CURRENT_SPRINT = 'CLEAR_CURRENT_SPRINT';
export const CLEAR_CURRENT_PROJECT = 'CLEAR_CURRENT_PROJECT';
export const CLEAR_CURRENT_PROJECT_DETAILS = 'CLEAR_CURRENT_PROJECT_DETAILS';

export const DEFAULT_PROFILE_IMAGE = '/assets/default_profile_image.jpg';

export const FILE_SIZE = 3 * 1024 * 1024;
export const SUPPORTED_IMAGE_FORMATS = ['image/jpg', 'image/jpeg', 'image/png'];

export const PDF_FORMAT = 'application/pdf';

export const FORM_DATA_HEADERS = { 'Content-Type': 'multipart/form-data' };
