import React, { useRef } from 'react';
import CustomButton from '../../../components/button/CustomButton';
import CustomInput from '../../../components/input/CustomInput';
import { login } from '../../../services/auth.service';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccessAction } from '../../../context/user.actions';

const Login = () => {
    const dispatch = useDispatch();
    const usernameRef = useRef(null);
    const passwordRef = useRef(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const validateForm = () => {
        if (!usernameRef || !passwordRef) {
            setError('Username and password are required');
            return false;
        }

        return true;
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        setError('');

        if (!validateForm()) {
            return;
        }

        const username = usernameRef.current.value;
        const password = passwordRef.current.value;

        login(username, password).then((result) => {
            dispatch(loginSuccessAction(...Object.values(result)));
            navigate('/home');
        });
    };

    return (
        <div className="login public-page-content">
            <h1>Login</h1>
            <form onSubmit={onSubmit}>
                <CustomInput type="text" label="Username" ref={usernameRef} />
                <CustomInput
                    type="password"
                    label="Password"
                    ref={passwordRef}
                />
                {error && <span className="input-error-message">{error}</span>}
                <CustomButton type="primary">Login</CustomButton>{' '}
                <div className="forgot-password-link-container">
                    <Link to="/forgot-password" className="link-button">
                        Forgot Password
                    </Link>
                </div>
            </form>
            <div className="link-navigate">
                <span>Don't have an account? </span>
                <Link to="/register" className="link-button">
                    Register
                </Link>
            </div>
        </div>
    );
};

export default Login;
