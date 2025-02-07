import React from 'react';
import { register } from '../../../services/user.service';
import { useNavigate, Link } from 'react-router-dom';
import CustomInput from '../../../components/input/CustomInput';
import CustomButton from '../../../components/button/CustomButton';
import * as Yup from 'yup';
import './Register.css';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

const Register = () => {
    const navigate = useNavigate();
    const validationSchema = Yup.object({
        firstName: Yup.string()
            .required('First name is required')
            .max(50, 'First name can contain maximum 30 characters'),
        lastName: Yup.string()
            .required('Last name is required')
            .max(50, 'Last name can contain maximum 30 characters'),
        username: Yup.string()
            .required('Username is required')
            .min(6, 'Username most contain at least 6 characters')
            .max(30, 'Username can contain maximum 30 characters'),
        email: Yup.string()
            .email('Invalid email format')
            .required('Email is required'),
        password: Yup.string()
            .required('Password is required')
            .min(8, 'Password must be at least 8 characters')
            .max(30, 'Password can contain maximum 30 characters')
            .matches(
                /[A-Z]/,
                'Password must contain at least one uppercase letter',
            )
            .matches(
                /[a-z]/,
                'Password must contain at least one lowercase letter',
            )
            .matches(/[0-9]/, 'Password must contain at least one number')
            .matches(
                /[\W_]/,
                'Password must contain at least one special character',
            ),
        repeatPassword: Yup.string()
            .required('Repeat Password is required')
            .oneOf([Yup.ref('password'), null], 'Passwords must match'),
    });

    const {
        register: hookRegister,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm({
        resolver: yupResolver(validationSchema),
        mode: 'onChange',
    });

    const onSubmit = async (data) => {
        await register(...Object.values(data));
        navigate('/');
    };

    return (
        <div className="register public-page-content">
            <h1>Register</h1>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="form-group">
                    <CustomInput
                        type="text"
                        label="First Name"
                        error={errors.firstName}
                        {...hookRegister('firstName')}
                    />
                    <span
                        className={`input-error-message ${errors.firstName ? 'visible' : ''}`}
                    >
                        {errors.firstName?.message}
                    </span>
                </div>
                <div className="form-group">
                    <CustomInput
                        type="text"
                        label="Last Name"
                        error={errors.lastName}
                        {...hookRegister('lastName')}
                    />
                    <span
                        className={`input-error-message ${errors.lastName ? 'visible' : ''}`}
                    >
                        {errors.lastName?.message}
                    </span>
                </div>
                <div className="form-group">
                    <CustomInput
                        type="text"
                        label="Username"
                        error={errors.username}
                        {...hookRegister('username')}
                    />
                    <span
                        className={`input-error-message ${errors.username ? 'visible' : ''}`}
                    >
                        {errors.username?.message}
                    </span>
                </div>
                <div className="form-group">
                    <CustomInput
                        type="email"
                        label="Email"
                        error={errors.email}
                        {...hookRegister('email')}
                    />
                    <span
                        className={`input-error-message ${errors.email ? 'visible' : ''}`}
                    >
                        {errors.email?.message}
                    </span>
                </div>
                <div className="form-group">
                    <CustomInput
                        type="password"
                        label="Password"
                        error={errors.password}
                        {...hookRegister('password')}
                    />
                    <span
                        className={`input-error-message ${errors.password ? 'visible' : ''}`}
                    >
                        {errors.password?.message}
                    </span>
                </div>
                <div className="form-group">
                    <CustomInput
                        type="password"
                        label="Repeat Password"
                        error={errors.repeatPassword}
                        {...hookRegister('repeatPassword')}
                    />
                    <span
                        className={`input-error-message ${errors.repeatPassword ? 'visible' : ''}`}
                    >
                        {errors.repeatPassword?.message}
                    </span>
                </div>
                <CustomButton type="primary" disabled={!isValid}>
                    Register
                </CustomButton>
            </form>
            <div className="link-navigate">
                <span>Already have an account? </span>
                <Link to="/login" className="link-button">
                    Login
                </Link>
            </div>
        </div>
    );
};

export default Register;
