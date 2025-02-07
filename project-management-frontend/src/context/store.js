import { configureStore, combineReducers } from '@reduxjs/toolkit';
import notificationReducer from './notifications.reducer.js';
import projectReducer from './project.reducer.js';
import userReducer from './user.reducer.js';

const rootReducer = combineReducers({
    user: userReducer,
    project: projectReducer,
    notifications: notificationReducer,
});

const store = configureStore({
    reducer: rootReducer,
    devTools: process.env.REACT_APP_NODE_ENV === 'development',
});

export default store;
