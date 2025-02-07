import api from '../config/axios.config';
import { FORM_DATA_HEADERS } from '../utils/constants.util';

//UPDATE
export const updateUserProfile = async (userProfile) => {
    return await api.put('/user-profile/update-user-profile', userProfile, {
        headers: FORM_DATA_HEADERS,
    });
};
