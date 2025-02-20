import './CreateTaskModal.css';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import {
    DEFAULT_PROFILE_IMAGE,
    FILE_SIZE,
    PDF_FORMAT,
    SUPPORTED_IMAGE_FORMATS,
} from '../../utils/constants.util';
import {
    BacklogStatus,
    TaskCategory,
    TaskPriority,
} from '../../utils/enums.util';
import CustomIcon from '../icon/CustomIcon';
import CustomButton from '../button/CustomButton';
import CustomSelect from '../select/CustomSelect';
import CustomInput from '../input/CustomInput';
import CustomFileDropBox from '../CustomFileDropBox/CustomFileDropBox';
import { useSelector } from 'react-redux';
import { createTask } from '../../services/task.service';

const CreateTaskModal = ({ users, onClose, onTaskCreated }) => {
    const { userId } = useSelector((state) => state.user);
    const { currentSprintId, backlogId } = useSelector(
        (state) => state.project,
    );

    const defaultValues = {
        category: 'Feature',
        priority: 'Low',
        backlogStatus: 'InPlanning',
        attachments: [],
    };

    const validationSchema = yup.object().shape({
        name: yup
            .string()
            .required('Task name is required')
            .min(3, 'Task name must be atleast 3 characters')
            .max(100, 'Task name can be most 100 characters long'),
        description: yup
            .string()
            .max(500, 'Task description can be most 500 characters long'),
        assigneeId: yup.string(),
        category: yup
            .string()
            .oneOf(
                Object.values(TaskCategory).map(
                    (category) => category.value.description,
                ),
                'Invalid category selected',
            )
            .required('Please select a category'),
        priority: yup
            .string()
            .oneOf(
                Object.values(TaskPriority).map(
                    (priority) => priority.value.description,
                ),
                'Invalid priority selected',
            )
            .required('Please select priority'),
        backlogStatus: yup
            .string()
            .oneOf(
                Object.values(BacklogStatus).map(
                    (backlogStatus) => backlogStatus.value.description,
                ),
                'Invalid backlog status selected',
            )
            .required('Please select backlog status'),
        storyPoints: yup
            .number()
            .transform((value, originalValue) =>
                originalValue === '' ? null : value,
            )
            .nullable(true)
            .min(0, 'Story points must be non-negative')
            .test(
                'is-multiple-of-0.5',
                'Story points must be in increments of 0.5',
                (value) => value !== undefined && value % 0.5 === 0,
            ),
        attachments: yup
            .array()
            .max(5, 'You can upload a maximum of 5 files.')
            .of(
                yup
                    .mixed()
                    .test(
                        'fileSize',
                        'File size is too large. Maximum size is 3MB.',
                        (value) => {
                            if (!value || !value.length) {
                                return true;
                            }
                            return value.size <= FILE_SIZE;
                        },
                    )
                    .test(
                        'fileFormat',
                        'Unsupported file format. Allowed formats: JPEG, PNG, JPG and PDF',
                        (value) => {
                            if (!value || !value.length) {
                                return true;
                            }
                            return (
                                SUPPORTED_IMAGE_FORMATS.includes(value.type) ||
                                value.type === PDF_FORMAT
                            );
                        },
                    ),
            ),
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        setValue,
        watch,
        control,
        trigger,
    } = useForm({
        resolver: yupResolver(validationSchema),
        mode: 'onChange',
        defaultValues: defaultValues,
    });

    const formatEnumOptions = (enumObject) =>
        Object.keys(enumObject).map((key) => {
            const { value, label, icon } = enumObject[key];
            return {
                value: value.description,
                label: (
                    <div className="select-component">
                        <CustomIcon name={icon} className="select-icon" />
                        <span>{label}</span>
                    </div>
                ),
            };
        });

    const formatUsersOptions = (users) =>
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

    const taskCategoryOptions = formatEnumOptions(TaskCategory);
    const backlogStatusOptions = formatEnumOptions(BacklogStatus);
    const taskPriorityOptions = formatEnumOptions(TaskPriority);

    const assigneeOptions = formatUsersOptions(users);

    const attachments = watch('attachments') || [];

    const handleFileChange = (files) => {
        setValue('attachments', files);
        trigger('attachments');
    };

    const onSubmit = async (data) => {
        const formData = new FormData();

        formData.append('name', data.name);
        formData.append('description', data.description);
        formData.append('assigneeId', data.assigneeId);
        formData.append('category', data.category);
        formData.append('priority', data.priority);
        formData.append('backlogStatus', data.backlogStatus);
        formData.append('storyPoints', data.storyPoints);
        formData.append('creatorId', userId);
        formData.append('backlogId', backlogId);
        formData.append('sprintId', currentSprintId);

        data.attachments.forEach((file) => {
            formData.append(`attachments`, file);
        });

        const newTask = await createTask(formData);

        onTaskCreated(newTask.createdTask);
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="create-task-modal-container">
                <div className="create-task-modal">
                    <div className="create-task-modal-header">
                        <h1>Create Task</h1>
                        <CustomIcon
                            name="times"
                            size="large"
                            onClick={onClose}
                            className="close-icon"
                        />
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="form-group">
                            <label htmlFor="name">Task Name</label>
                            <CustomInput
                                type="text"
                                id="name"
                                error={errors.name}
                                {...register('name')}
                            />
                            <span
                                className={`input-error-message ${errors.name ? 'visible' : ''}`}
                            >
                                {errors.name?.message}
                            </span>
                        </div>
                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <CustomInput
                                type="text"
                                id="description"
                                error={errors.description}
                                {...register('description')}
                            />
                            <span
                                className={`input-error-message ${errors.description ? 'visible' : ''}`}
                            >
                                {errors.description?.message}
                            </span>
                        </div>
                        <div className="form-group">
                            <label htmlFor="assigneeId">Assignee</label>
                            <Controller
                                name="assigneeId"
                                control={control}
                                render={({ field }) => (
                                    <CustomSelect
                                        {...field}
                                        options={assigneeOptions}
                                        placeholder="Select Assignee"
                                        isMulti={false}
                                        onChange={(selected) =>
                                            field.onChange(
                                                selected ? selected.value : '',
                                            )
                                        }
                                        value={assigneeOptions.find(
                                            (option) =>
                                                option.value === field.value,
                                        )}
                                    />
                                )}
                            />
                            <span
                                className={`input-error-message ${errors.assigneId ? 'visible' : ''}`}
                            >
                                {errors.backlogStatus?.message}
                            </span>
                        </div>
                        <div className="form-group">
                            <label htmlFor="category">Category</label>
                            <Controller
                                name="category"
                                control={control}
                                render={({ field }) => (
                                    <CustomSelect
                                        {...field}
                                        options={taskCategoryOptions}
                                        isMulti={false}
                                        placeholder="Select Category"
                                        onChange={(selected) =>
                                            field.onChange(
                                                selected ? selected.value : '',
                                            )
                                        }
                                        value={taskCategoryOptions.find(
                                            (option) =>
                                                option.value === field.value,
                                        )}
                                    />
                                )}
                            />
                            <span
                                className={`input-error-message ${errors.category ? 'visible' : ''}`}
                            >
                                {errors.category?.message}
                            </span>
                        </div>
                        <div className="form-group">
                            <label htmlFor="priority">Priority</label>
                            <Controller
                                name="priority"
                                control={control}
                                render={({ field }) => (
                                    <CustomSelect
                                        {...field}
                                        options={taskPriorityOptions}
                                        isMulti={false}
                                        placeholder="Select Priority"
                                        onChange={(selected) =>
                                            field.onChange(
                                                selected ? selected.value : '',
                                            )
                                        }
                                        value={taskPriorityOptions.find(
                                            (option) =>
                                                option.value === field.value,
                                        )}
                                    />
                                )}
                            />
                            <span
                                className={`input-error-message ${errors.priority ? 'visible' : ''}`}
                            >
                                {errors.priority?.message}
                            </span>
                        </div>
                        <div className="form-group">
                            <label htmlFor="backlogStatus">
                                Backlog Status
                            </label>
                            <Controller
                                name="backlogStatus"
                                control={control}
                                render={({ field }) => (
                                    <CustomSelect
                                        {...field}
                                        options={backlogStatusOptions}
                                        isMulti={false}
                                        placeholder="Select Category"
                                        onChange={(selected) =>
                                            field.onChange(
                                                selected ? selected.value : '',
                                            )
                                        }
                                        value={backlogStatusOptions.find(
                                            (option) =>
                                                option.value === field.value,
                                        )}
                                    />
                                )}
                            />
                            <span
                                className={`input-error-message ${errors.backlogStatus ? 'visible' : ''}`}
                            >
                                {errors.backlogStatus?.message}
                            </span>
                        </div>
                        <div className="form-group">
                            <label htmlFor="storyPoints">Story Points </label>
                            <CustomInput
                                type="number"
                                step="0.5"
                                id="storyPoints"
                                error={errors.storyPoints}
                                {...register('storyPoints')}
                            />
                            <span
                                className={`input-error-message ${errors.storyPoints ? 'visible' : ''}`}
                            >
                                {errors.storyPoints?.message}
                            </span>
                        </div>
                        <div className="form-group">
                            <label htmlFor="attachments">Attachments</label>
                            <CustomFileDropBox
                                files={attachments}
                                setFiles={handleFileChange}
                            />
                            <span
                                className={`input-error-message ${errors.attachments ? 'visible' : ''}`}
                            >
                                {errors.attachments?.message}
                            </span>
                        </div>
                        <div className="form-footer">
                            <CustomButton type="primary" disabled={!isValid}>
                                Create Task
                            </CustomButton>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateTaskModal;
