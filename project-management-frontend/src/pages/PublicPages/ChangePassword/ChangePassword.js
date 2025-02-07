import React, { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import CustomInput from '../../../components/input/CustomInput';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    changePassword,
    verifyPasswordToken,
} from '../../../services/user.service';
import CustomButton from '../../../components/button/CustomButton';

const ChangePassword = () => {
    const [forgotPasswordToken, setForgotPasswordToken] = useState('');
    const location = useLocation();
    const navigate = useNavigate();

    const validationSchema = Yup.object({
        newPassword: Yup.string()
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
        repeatNewPassword: Yup.string()
            .required('Repeat Password is required')
            .oneOf([Yup.ref('newPassword'), null], 'Passwords must match'),
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm({
        resolver: yupResolver(validationSchema),
        mode: 'onChange',
    });

    useEffect(() => {
        const tokenVerification = async () => {
            try {
                const searchParams = new URLSearchParams(location.search);
                const token = searchParams.get('token');
                setForgotPasswordToken(token);
                await verifyPasswordToken(token);
            } catch (error) {
                navigate('/login');
            }
        };
        tokenVerification();
    }, [location.search, navigate]);

    const onSubmit = async (data) => {
        await changePassword(
            forgotPasswordToken,
            data.newPassword,
            data.repeatNewPassword,
        ).then(() => navigate('/login'));
    };

    return (
        <div className="change-password public-page-content">
            <h1>Change Password</h1>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="form-group">
                    <CustomInput
                        type="password"
                        label="New Password"
                        {...register('newPassword')}
                    />
                    <span
                        className={`input-error-message ${errors.newPassword ? 'visible' : ''}`}
                    >
                        {errors.newPassword?.message}
                    </span>
                </div>
                <div className="form-group">
                    <CustomInput
                        type="password"
                        label="Repeat New Password"
                        {...register('repeatNewPassword')}
                    />
                    <span
                        className={`input-error-message ${errors.repeatNewPassword ? 'visible' : ''}`}
                    >
                        {errors.repeatNewPassword?.message}
                    </span>
                </div>
                <CustomButton type="primary" disabled={!isValid}>
                    Change Password
                </CustomButton>
            </form>
        </div>
    );
};

export default ChangePassword;
