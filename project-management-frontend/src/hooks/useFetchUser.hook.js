import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getUserData } from '../services/user.service';
import { loginSuccessAction } from '../context/user.actions';
import { setCurrentProjectSuccessAction } from '../context/project.actions';

const useFetchUser = () => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserDataAsync = async () => {
            try {
                const userData = await getUserData();
                if (userData) {
                    dispatch(loginSuccessAction(...Object.values(userData)));

                    if (userData.selectedProjectId) {
                        dispatch(
                            setCurrentProjectSuccessAction(
                                userData.selectedProjectId,
                            ),
                        );
                    }
                }
            } finally {
                setLoading(false);
            }
        };
        fetchUserDataAsync();
    }, [dispatch]);

    return loading;
};

export default useFetchUser;
