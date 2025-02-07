import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyEmail } from '../../../services/user.service';

const EmailVerification = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const hasVerified = useRef(false);

    useEffect(() => {
        const emailVerification = async () => {
            try {
                if (hasVerified.current) {
                    return;
                }
                hasVerified.current = true;
                const searchParams = new URLSearchParams(location.search);
                const token = searchParams.get('token');
                await verifyEmail(token);
            } finally {
                navigate('/login');
            }
        };
        emailVerification();
    }, [location.search, navigate]);

    return null;
};

export default EmailVerification;
