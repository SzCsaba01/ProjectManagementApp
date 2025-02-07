import axios from 'axios';
import apiConfig from './api.config';
import store from '../context/store';
import { addNotification } from '../context/notification.actions';

const api = axios.create({
    baseURL: apiConfig.API_URL,
    headers: apiConfig.headers,
    withCredentials: true,
});

api.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

let navigateFn;

export const setNavigate = (navigate) => {
    navigateFn = navigate;
};

api.interceptors.response.use(
    (response) => {
        if (response.data.message) {
            store.dispatch(addNotification(response.data.message, 'success'));
        }
        return response;
    },
    async (error) => {
        if (error.response?.data?.errorCode === 'TOKEN_MISSING') {
            return Promise.reject(error);
        }

        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                await api.get('/auth/refresh-token');
                return api(originalRequest);
            } catch (err) {
                if (navigateFn) {
                    navigateFn('/login');
                }
            }
        }

        store.dispatch(
            addNotification(
                error.response?.data?.error?.message ||
                    'Something went wrong! Please try again later!',
                'error',
            ),
        );
        return Promise.reject(error);
    },
);
export default api;
