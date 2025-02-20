import './EditSprintModal.css';
import CustomIcon from '../icon/CustomIcon';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { updateSprint } from '../../services/sprint.service';
import CustomInput from '../input/CustomInput';
import CustomDatePicker from '../datePicker/CustomDatePicker';
import CustomButton from '../button/CustomButton';

const EditSprintModal = ({ sprint, onUpdateSprint, onClose }) => {
    const validationSchema = yup.object().shape({
        name: yup
            .string()
            .required('Sprint name is required')
            .min(3, 'Sprint name must be atelast 3 characters')
            .max(100, 'Sprint name can be most 100 caracters long'),
        startDate: yup.date().required('Start date is required'),
        plannedEndDate: yup
            .date()
            .required('Planned end date is required')
            .min(
                yup.ref('startDate'),
                'Planned end date cannot be before the start date',
            ),
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
        defaultValues: sprint,
    });

    const startDate = watch('startDate');

    const handleDateChange = (field, value) => {
        setValue(field, value);
        trigger('startDate');
        trigger('plannedEndDate');

        if (field === 'startDate' && !value) {
            setValue('plannedEndDate', null);
        }
    };

    const onSubmit = async (data) => {
        onUpdateSprint(data);
        await updateSprint(data);
    };

    const formValues = watch();
    const hasChanges = JSON.stringify(formValues) !== JSON.stringify(sprint);

    return (
        <div className="modal-overlay">
            <div className="edit-sprint-modal-container">
                <div className="edit-sprint-modal">
                    <div className="edit-sprint-modal-header">
                        <h1>Edit Sprint</h1>
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
                            <span
                                className={`input-error-message ${errors.startDate ? 'visible' : ''}`}
                            >
                                {errors.startDate?.message}
                            </span>
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
                            <span
                                className={`input-error-message ${errors.plannedEndDate ? 'visible' : ''}`}
                            >
                                {errors.plannedEndDate?.message}
                            </span>
                        </div>
                        <div className="form-footer">
                            <CustomButton
                                type="primary"
                                disabled={!hasChanges || !isValid}
                            >
                                Save Sprint
                            </CustomButton>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditSprintModal;
