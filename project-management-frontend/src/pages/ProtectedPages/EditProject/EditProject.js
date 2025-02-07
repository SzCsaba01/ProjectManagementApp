import { useState, useEffect } from 'react';
import './EditProject.css';
import {
    getAllUsersForProject,
    getManagers,
} from '../../../services/user.service';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import CustomInput from '../../../components/input/CustomInput';
import CustomButton from '../../../components/button/CustomButton';
import CustomSelect from '../../../components/select/CustomSelect';
import { DEFAULT_PROFILE_IMAGE } from '../../../utils/constants.util';
import { updateProject } from '../../../services/project.service';
import { useNavigate, useLocation } from 'react-router-dom';

const EditProject = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { projectDetails, owner, users } = location.state || {};

    const [managers, setManagers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);

    const validationSchema = yup.object().shape({
        projectName: yup
            .string()
            .required('Project name is required')
            .min(3, 'Project name must be at least 3 characters')
            .max(50, 'Project name can be at most 50 characters long'),
        manager: yup.string().required('Please select a manager'),
        teamMembers: yup.array().min(1, 'Select at least one team member'),
    });

    useEffect(() => {
        const fetchManagers = async () => {
            let result = await getManagers();

            setManagers(result);
        };

        const fetchUsers = async () => {
            let result = await getAllUsersForProject();

            setAllUsers(result);
        };

        fetchManagers();
        fetchUsers();
    }, [owner, users]);

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        control,
    } = useForm({
        resolver: yupResolver(validationSchema),
        mode: 'onChange',
        defaultValues: {
            projectName: projectDetails.projectName,
            manager: owner.userId,
            teamMembers: users.map((user) => user.userId) || [],
        },
    });

    const formatOptions = (users) =>
        users.map((user) => ({
            value: user.userId,
            label: (
                <div className="select-component">
                    <img
                        src={user.avatar || DEFAULT_PROFILE_IMAGE}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="select-avatar"
                    />
                    {user.firstName} {user.lastName}
                </div>
            ),
            ...user,
        }));

    const managerOptions = formatOptions(managers);
    const userOptions = formatOptions(allUsers);

    const onSubmit = async (data) => {
        await updateProject({ ...data, projectId: projectDetails.projectId });
        navigate('../projects');
    };

    return (
        <div className="edit-project-container">
            <h1>Edit Project</h1>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="form-group">
                    <label htmlFor="projectName">Project Name</label>
                    <CustomInput
                        type="text"
                        id="projectName"
                        error={errors.projectName}
                        {...register('projectName')}
                    />
                    <span
                        className={`input-error-message ${errors.projectName ? 'visible' : ''}`}
                    >
                        {errors.projectName?.message}
                    </span>
                </div>

                <div className="form-group">
                    <label htmlFor="manager">Manager</label>
                    <Controller
                        name="manager"
                        control={control}
                        render={({ field }) => (
                            <CustomSelect
                                {...field}
                                options={managerOptions}
                                isMulti={false}
                                placeholder="Select Manager"
                                onChange={(selected) =>
                                    field.onChange(
                                        selected ? selected.value : '',
                                    )
                                }
                                value={managerOptions.find(
                                    (option) => option.value === field.value,
                                )}
                                className="select-container"
                            />
                        )}
                    />
                    <span
                        className={`input-error-message ${errors.manager ? 'visible' : ''}`}
                    >
                        {errors.manager?.message}
                    </span>
                </div>

                <div className="form-group">
                    <label htmlFor="teamMembers">Team Members</label>
                    <Controller
                        name="teamMembers"
                        control={control}
                        render={({ field }) => (
                            <CustomSelect
                                {...field}
                                options={userOptions}
                                isMulti={true}
                                placeholder="Select Team Members"
                                onChange={(selected) =>
                                    field.onChange(
                                        selected
                                            ? selected.map((item) => item.value)
                                            : [],
                                    )
                                }
                                value={userOptions.filter((option) =>
                                    field.value?.includes(option.value),
                                )}
                                className="select-container"
                            />
                        )}
                    />
                    <span
                        className={`input-error-message ${errors.teamMembers ? 'visible' : ''}`}
                    >
                        {errors.teamMembers?.message}
                    </span>
                </div>

                <div className="edit-project-footer">
                    <CustomButton type="primary" disabled={!isValid}>
                        Save Changes
                    </CustomButton>
                </div>
            </form>
        </div>
    );
};

export default EditProject;
