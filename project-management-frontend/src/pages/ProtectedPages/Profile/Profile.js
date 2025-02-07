import React, { useEffect, useState } from 'react';
import * as yup from 'yup';
import {
    FILE_SIZE,
    SUPPORTED_IMAGE_FORMATS,
} from '../../../utils/constants.util';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import CustomInput from '../../../components/input/CustomInput';
import './Profile.css';
import { useDispatch, useSelector } from 'react-redux';
import CustomButton from '../../../components/button/CustomButton';
import { updateUserProfile } from '../../../services/user-profile.service';
import { updateUserProfileSuccessAction } from '../../../context/user.actions';

const Profile = () => {
    const dispatch = useDispatch();
    const [image, setImage] = useState('/assets/default_profile_image.jpg');

    const user = useSelector((state) => state.user);

    const validationSchema = yup.object({
        firstName: yup
            .string()
            .required('First name is required')
            .max(50, 'Fist name can contain maximum 30 characters'),
        lastName: yup
            .string()
            .required('Last name is required')
            .max(50, 'Last name can contain maximum 30 characters'),
        avatar: yup
            .mixed()
            .nullable()
            .test(
                'fileSize',
                'File size is too large. Maximum size is 3MB.',
                (value) => {
                    if (!value || !value.length) {
                        return true;
                    }
                    return value[0].size <= FILE_SIZE;
                },
            )
            .test(
                'fileFormat',
                'Unsupported file format. Allowed formats: JPEG, PNG',
                (value) => {
                    if (!value || !value.length) {
                        return true;
                    }
                    return SUPPORTED_IMAGE_FORMATS.includes(value[0].type);
                },
            ),
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid },
    } = useForm({
        resolver: yupResolver(validationSchema),
        mode: 'onChange',
    });

    useEffect(() => {
        if (user) {
            reset({
                firstName: user.firstName,
                lastName: user.lastName,
                avatar: null,
            });

            if (user.avatar) {
                setImage(user.avatar);
            }
        }
    }, [user, reset]);

    const handleImageChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            setImage(URL.createObjectURL(selectedFile));
        }
    };

    const onSubmit = async (data) => {
        const formData = new FormData();

        formData.append('firstName', data.firstName);
        formData.append('lastName', data.lastName);
        formData.append('username', user.username);
        formData.append('userId', user.userId);

        if (data.avatar) {
            formData.append('avatar', data.avatar[0]);
        }

        await updateUserProfile(formData);
        dispatch(
            updateUserProfileSuccessAction(
                data.firstName,
                data.lastName,
                image,
            ),
        );
    };

    return (
        <div className="profile-container">
            <h1>User Profile</h1>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="profile-image-container">
                    <img
                        src={image}
                        alt="Profile"
                        className="profile-image"
                        onClick={() =>
                            document.getElementById('fileInput').click()
                        }
                    />
                    <span
                        className={`input-error-message ${errors.avatar ? 'visible' : ''} `}
                    >
                        {' '}
                        {errors.avatar?.message}
                    </span>
                </div>
                <CustomInput
                    type="text"
                    label="Username"
                    value={user.username || ''}
                    disabled
                />
                <CustomInput
                    type="text"
                    label="Email"
                    value={user.email || ''}
                    disabled
                />
                <CustomInput
                    type="text"
                    label="First Name"
                    error={errors.firstName}
                    {...register('firstName')}
                />
                <span
                    className={`input-error-message ${errors.firstName ? 'visible' : ''} `}
                >
                    {' '}
                    {errors.firstName?.message}
                </span>
                <CustomInput
                    type="text"
                    label="Last Name"
                    error={errors.lastName}
                    {...register('lastName')}
                />
                <span
                    className={`input-error-message ${errors.lastName ? 'visible' : ''} `}
                >
                    {' '}
                    {errors.lastName?.message}
                </span>
                <CustomInput
                    id="fileInput"
                    accept="image/*"
                    type="file"
                    className="file-input"
                    error={errors.avatar}
                    {...register('avatar')}
                    onChange={(e) => {
                        register('avatar').onChange(e);
                        handleImageChange(e);
                    }}
                />
                <div className="profile-footer">
                    <CustomButton type="primary" disabled={!isValid}>
                        Update
                    </CustomButton>
                </div>
            </form>
        </div>
    );
};

export default Profile;
