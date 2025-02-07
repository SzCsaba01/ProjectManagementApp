import api from '../config/axios.config';
import LoginRequestDTO from '../dtos/user/login-request.dto';

export const login = async (username, password) => {
    const loginRequest = new LoginRequestDTO(username, password);
    return (await api.put('/auth/login', loginRequest)).data;
};

export const logout = async () => {
    await api.get('/auth/logout');
};

export const refreshToken = async (refreshToken) => {
    await api.post('/auth/refreshToken', {
        params: {
            token: refreshToken,
        },
    });
};
