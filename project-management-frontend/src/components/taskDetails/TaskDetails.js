import './TaskDetails.css';
import 'react-datepicker/dist/react-datepicker.css';
import { useEffect } from 'react';
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

const TaskDetails = ({ users, backlogId, task, onClose, onTaskModified }) => {
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
        creatorId: yup.string(),
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

        data.attachments.forEach((attachment) => {
            if (typeof attachment === 'string') {
                formData.append('attachments[]', attachment);
            } else {
                formData.append('files', attachment);
            }
        });

        const updatedTask = await updateTask(formData);
        onTaskModified(updatedTask);
        reset(updatedTask);
    };

    return (
        <div className="task-details-container">
            <div className="task-details-header">
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
                                    (option) => option.value === field.value,
                                )}
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
                                    (option) => option.value === field.value,
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
                                    (option) => option.value === field.value,
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
                            />
                        )}
                    />
                </div>
                <div className="form-group">
                    <label>Start Date</label>
                    <Controller
                        name="startedAt"
                        control={control}
                        render={({ field }) => (
                            <CustomDatePicker
                                minDate={plannedAt}
                                disabled={!plannedAt}
                                selected={field.value}
                                onChange={(date) =>
                                    handleDateChange('startedAt', date)
                                }
                                placeholder="Select start date"
                            />
                        )}
                    />
                </div>
                <div className="form-group">
                    <label>Completed Date</label>
                    <Controller
                        name="completedAt"
                        control={control}
                        render={({ field }) => (
                            <CustomDatePicker
                                minDate={startedAt}
                                disabled={!startedAt}
                                selected={field.value}
                                onChange={(date) =>
                                    handleDateChange('completedAt', date)
                                }
                                placeholder="Select complete date"
                            />
                        )}
                    />
                </div>
                <div className="form-group">
                    <label>Finished Date</label>
                    <Controller
                        name="finishedAt"
                        control={control}
                        render={({ field }) => (
                            <CustomDatePicker
                                minDate={completedAt}
                                disabled={!completedAt}
                                selected={field.value}
                                onChange={(date) =>
                                    handleDateChange('finishedAt', date)
                                }
                                placeholder="Select finish date"
                            />
                        )}
                    />
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
                    <CustomButton
                        type="primary"
                        disabled={!isValid || !hasChanges}
                    >
                        Save Task
                    </CustomButton>
                </div>
            </form>
        </div>
    );
};
export default TaskDetails;
