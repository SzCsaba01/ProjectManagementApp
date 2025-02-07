import './CreateSprintModal.css';
import CustomIcon from '../icon/CustomIcon';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { createSprint } from '../../services/sprint.service';
import CustomInput from '../input/CustomInput';
import CustomDatePicker from '../datePicker/CustomDatePicker';
import CustomButton from '../button/CustomButton';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentSprintAction } from '../../context/project.actions';

const CreateSprintModal = ({ onClose }) => {
    const dispatch = useDispatch();

    const { projectId, backlogId } = useSelector((state) => state.project);

    const validationSchema = yup.object().shape({
        name: yup
            .string()
            .required('Sprint name is required')
            .min(3, 'Sprint name must be atelast 3 characters')
            .max(100, 'Sprint name can be most 100 caracters long'),
        startDate: yup.date().required('Start date is required'),
        plannedEndDate: yup.date().required('Planned end date is required'),
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        setValue,
        control,
        trigger,
        watch,
    } = useForm({
        resolver: yupResolver(validationSchema),
        mode: 'onChange',
    });

    const startDate = watch('startDate');

    const handleDateChange = (field, value) => {
        setValue(field, value);
        trigger(field);

        if (field === 'startDate' && !value) {
            setValue('plannedEndDate', null);
        }
    };

    const onSubmit = async (data) => {
        const sprint = await createSprint(projectId, backlogId, data);
        console.log(sprint);

        dispatch(setCurrentSprintAction(sprint.sprintId));

        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="create-sprint-modal-container">
                <div className="create-sprint-modal">
                    <div className="create-sprint-modal-header">
                        <h1>Create Sprint</h1>
                        <CustomIcon
                            name="times"
                            size="large"
                            onClick={onClose}
                            className="close-icon"
                        />
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="form-group">
                            <label htmlFor="name">Sprint name</label>
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
                            <label>Start Date</label>
                            <Controller
                                name="startDate"
                                control={control}
                                render={({ field }) => (
                                    <CustomDatePicker
                                        selected={field.value}
                                        onChange={(date) =>
                                            handleDateChange('startDate', date)
                                        }
                                        placeholder="Select start date"
                                    />
                                )}
                            />
                        </div>
                        <div className="form-group">
                            <label>Planned End Date</label>
                            <Controller
                                name="plannedEndDate"
                                control={control}
                                render={({ field }) => (
                                    <CustomDatePicker
                                        minDate={startDate}
                                        disabled={!startDate}
                                        selected={field.value}
                                        onChange={(date) =>
                                            handleDateChange(
                                                'plannedEndDate',
                                                date,
                                            )
                                        }
                                        placeholder="Select planned end date"
                                    />
                                )}
                            />
                        </div>
                        <div className="form-footer">
                            <CustomButton type="primary" disabled={!isValid}>
                                Create Sprint
                            </CustomButton>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateSprintModal;
