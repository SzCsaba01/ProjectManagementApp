import './TaskDetails.css';
import 'react-datepicker/dist/react-datepicker.css';
import { useEffect, useState } from 'react';
import * as yup from 'yup';
import {
    DEFAULT_PROFILE_IMAGE,
    FILE_SIZE,
    PDF_FORMAT,
    SUPPORTED_IMAGE_FORMATS,
} from '../../utils/constants.util';
import { TaskCategory, TaskPriority } from '../../utils/enums.util';
import CustomIcon from '../icon/CustomIcon';
import CustomButton from '../button/CustomButton';
import CustomSelect from '../select/CustomSelect';
import CustomInput from '../input/CustomInput';
import CustomFileDropBox from '../CustomFileDropBox/CustomFileDropBox';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { updateTask } from '../../services/task.service';
import CustomDatePicker from '../datePicker/CustomDatePicker';
import ConfirmationPopup from '../confirmationPopup/ConfirmationPopup';

const TaskDetails = ({
    users,
    backlogId,
    sprintId,
    type,
    task,
    onClose,
    onDelete,
    readOnly = false,
}) => {
    const [showConfirmation, setShowConfirmation] = useState(false);

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
        creatorId: yup.string().required('Creater is required'),
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
        plannedAt: yup.date().nullable(),
        startedAt: yup.date().nullable(),
        completedAt: yup.date().nullable(),
        finishedAt: yup.date().nullable(),
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
                            if (typeof value === 'string') {
                                return true;
                            }
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
                            if (typeof value === 'string') {
                                return true;
                            }

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
        reset,
    } = useForm({
        resolver: yupResolver(validationSchema),
        mode: 'onChange',
        defaultValues: task,
    });

    useEffect(() => {
        if (task) {
            reset(task);
        }
    }, [task, reset]);

    const formValues = watch();
    const hasChanges = JSON.stringify(formValues) !== JSON.stringify(task);

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
                        alt={`${user.firstname} ${user.lastName}`}
                        className="select-avatar"
                    />
                    {user.firstName} {user.lastName}
                </div>
            ),
        }));

    const taskCategoryOptions = formatEnumOptions(TaskCategory);
    const taskPriorityOptions = formatEnumOptions(TaskPriority);

    const assigneeOptions = formatUsersOptions(users);
    const creatorOptions = formatUsersOptions(users);

    const attachments = watch('attachments') || [];
    const plannedAt = watch('plannedAt') || undefined;
    const startedAt = watch('startedAt') || undefined;
    const completedAt = watch('completedAt') || undefined;

    const handleDateChange = (field, value) => {
        setValue(field, value);
        trigger(field);

        if (field === 'plannedAt' && !value) {
            setValue('startedAt', null);
            setValue('completedAt', null);
            setValue('finishedAt', null);
        }
        if (field === 'startedAt' && !value) {
            setValue('completedAt', null);
            setValue('finishedAt', null);
        }
        if (field === 'completedAt' && !value) {
            setValue('finishedAt', null);
        }
    };

    const handleFileChange = (files) => {
        setValue('attachments', files);
        trigger('attachments');
    };

    const handleConfirmationChange = () => {
        setShowConfirmation(!showConfirmation);
    };

    const handleOnConfirmation = () => {
        setShowConfirmation(!showConfirmation);
        onDelete(task);
    };

    const onSubmit = async (data) => {
        const formData = new FormData();

        formData.append('_id', task._id);
        formData.append('name', data.name);
        formData.append('description', data.description);
        formData.append('assigneeId', data.assigneeId);
        formData.append('category', data.category);
        formData.append('priority', data.priority);
        formData.append('creatorId', data.creatorId);
        formData.append('backlogId', backlogId);
        formData.append('sprintId', sprintId);
        formData.append('type', type);
        formData.append('storyPoints', data.storyPoints);
        if (data.plannedAt) {
            formData.append('plannedAt', data.plannedAt);
        }
        if (data.startedAt) {
            formData.append('startedAt', data.startedAt);
        }
        if (data.completedAt) {
            formData.append('completedAt', data.completedAt);
        }
        if (data.finishedAt) {
            formData.append('finishedAt', data.finishedAt);
        }

        data.attachments.forEach((attachment) => {
            if (typeof attachment === 'string') {
                formData.append('attachments[]', attachment);
            } else {
                formData.append('files', attachment);
            }
        });

        await updateTask(formData);
    };

    return (
        <>
            <div className="task-details-container">
                <div
                    className={`task-details-header ${readOnly ? 'flex-end' : ''}`}
                >
                    {!readOnly && (
                        <CustomIcon
                            name="trash"
                            size="medium"
                            onClick={handleConfirmationChange}
                            className="delete-icon"
                        />
                    )}
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
                            disabled={readOnly}
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
                            disabled={readOnly}
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
                                    placeholder={
                                        readOnly ? '' : 'Select Assignee'
                                    }
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
                                    disabled={readOnly}
                                />
                            )}
                        />
                        <span
                            className={`input-error-message ${errors.assigneId ? 'visible' : ''}`}
                        >
                            {errors.assigneId?.message}
                        </span>
                    </div>
                    <div className="form-group">
                        <label htmlFor="creatorId">Creator</label>
                        <Controller
                            name="creatorId"
                            control={control}
                            render={({ field }) => (
                                <CustomSelect
                                    {...field}
                                    options={creatorOptions}
                                    placeholder={
                                        readOnly ? '' : 'Select Creator'
                                    }
                                    isMulti={false}
                                    onChange={(selected) =>
                                        field.onChange(
                                            selected ? selected.value : '',
                                        )
                                    }
                                    value={creatorOptions.find(
                                        (option) =>
                                            option.value === field.value,
                                    )}
                                    disabled={readOnly}
                                />
                            )}
                        />
                        <span
                            className={`input-error-message ${errors.creatorId ? 'visible' : ''}`}
                        >
                            {errors.creatorId?.message}
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
                                    disabled={readOnly}
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
                                    disabled={readOnly}
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
                        <label htmlFor="storyPoints">Story Points </label>
                        <CustomInput
                            type="number"
                            step="0.5"
                            id="storyPoints"
                            error={errors.storyPoints}
                            {...register('storyPoints')}
                            disabled={readOnly}
                        />
                        <span
                            className={`input-error-message ${errors.storyPoints ? 'visible' : ''}`}
                        >
                            {errors.storyPoints?.message}
                        </span>
                    </div>
                    <div className="form-group">
                        <label>Planning Date</label>
                        <Controller
                            name="plannedAt"
                            control={control}
                            render={({ field }) => (
                                <CustomDatePicker
                                    selected={field.value}
                                    onChange={(date) =>
                                        handleDateChange('plannedAt', date)
                                    }
                                    placeholder="Select plan date"
                                    disabled={readOnly}
                                />
                            )}
                        />
                        <span
                            className={`input-error-message ${errors.plannedAt ? 'visible' : ''}`}
                        >
                            {errors.plannedAt?.message}
                        </span>
                    </div>
                    <div className="form-group">
                        <label>Start Date</label>
                        <Controller
                            name="startedAt"
                            control={control}
                            render={({ field }) => (
                                <CustomDatePicker
                                    minDate={plannedAt}
                                    disabled={!plannedAt || readOnly}
                                    selected={field.value}
                                    onChange={(date) =>
                                        handleDateChange('startedAt', date)
                                    }
                                    placeholder="Select start date"
                                />
                            )}
                        />
                        <span
                            className={`input-error-message ${errors.startedAt ? 'visible' : ''}`}
                        >
                            {errors.startedAt?.message}
                        </span>
                    </div>
                    <div className="form-group">
                        <label>Completed Date</label>
                        <Controller
                            name="completedAt"
                            control={control}
                            render={({ field }) => (
                                <CustomDatePicker
                                    minDate={startedAt}
                                    disabled={!startedAt || readOnly}
                                    selected={field.value}
                                    onChange={(date) =>
                                        handleDateChange('completedAt', date)
                                    }
                                    placeholder="Select complete date"
                                />
                            )}
                        />
                        <span
                            className={`input-error-message ${errors.completedAt ? 'visible' : ''}`}
                        >
                            {errors.completedAt?.message}
                        </span>
                    </div>
                    <div className="form-group">
                        <label>Finished Date</label>
                        <Controller
                            name="finishedAt"
                            control={control}
                            render={({ field }) => (
                                <CustomDatePicker
                                    minDate={completedAt}
                                    disabled={!completedAt || readOnly}
                                    selected={field.value}
                                    onChange={(date) =>
                                        handleDateChange('finishedAt', date)
                                    }
                                    placeholder="Select finish date"
                                />
                            )}
                        />
                        <span
                            className={`input-error-message ${errors.finishedAt ? 'visible' : ''}`}
                        >
                            {errors.finishedAt?.message}
                        </span>
                    </div>
                    <div className="form-group">
                        <label htmlFor="attachments">Attachments</label>
                        <CustomFileDropBox
                            files={attachments}
                            setFiles={handleFileChange}
                            disabled={readOnly}
                        />
                        <span
                            className={`input-error-message ${errors.attachments ? 'visible' : ''}`}
                        >
                            {errors.attachments?.message}
                        </span>
                    </div>
                    {!readOnly && (
                        <div className="form-footer">
                            <CustomButton
                                type="primary"
                                disabled={!isValid || !hasChanges || readOnly}
                            >
                                Save Task
                            </CustomButton>
                        </div>
                    )}
                </form>
            </div>
            {showConfirmation && (
                <ConfirmationPopup
                    message="Are you sure you want to delete this task?"
                    onCancel={handleConfirmationChange}
                    onConfirm={handleOnConfirmation}
                />
            )}
        </>
    );
};
export default TaskDetails;
