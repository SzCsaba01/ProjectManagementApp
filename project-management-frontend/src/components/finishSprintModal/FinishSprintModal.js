import './FinishSprintModal.css';
import CustomIcon from '../icon/CustomIcon';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import CustomDatePicker from '../datePicker/CustomDatePicker';
import CustomButton from '../button/CustomButton';
import { finishSprint } from '../../services/sprint.service';
import { useDispatch, useSelector } from 'react-redux';
import { clearCurrentSprintAction } from '../../context/project.actions';

const FinishSprintModal = ({ sprint, projectId, onFinishSprint, onClose }) => {
    const dispatch = useDispatch();
    const { finishedSprintIds } = useSelector((state) => state.project);
    const startDate = new Date(sprint.startDate);
    const validationSchema = yup.object().shape({
        endDate: yup
            .date()
            .required('End date is required')
            .min(startDate, 'End date must be after the start date'),
    });

    const {
        control,
        handleSubmit,
        formState: { errors, isValid },
        setValue,
        trigger,
    } = useForm({
        resolver: yupResolver(validationSchema),
        mode: 'onChange',
        defaultValues: { endDate: null },
    });

    const formatDate = (dateValue) => {
        return new Intl.DateTimeFormat('en-GB', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).format(dateValue);
    };

    const handleDateChange = (value) => {
        setValue('endDate', value);
        trigger('endDate');
    };

    const onSubmit = async (data) => {
        const sprintData = {
            endDate: data.endDate,
            sprintId: sprint._id,
            projectId: projectId,
        };
        await finishSprint(sprintData);

        const newFinishedSprints = [sprint._id, ...finishedSprintIds];
        dispatch(clearCurrentSprintAction(newFinishedSprints));
        onFinishSprint();
    };

    return (
        <div className="modal-overlay">
            <div className="finish-sprint-modal-container">
                <div className="finish-sprint-modal">
                    <div className="finish-sprint-modal-header">
                        <h1>Finish Sprint</h1>
                        <CustomIcon
                            name="times"
                            size="large"
                            onClick={onClose}
                            className="close-icon"
                        />
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="start-date-section">
                            <span>
                                <label>Start Date: </label>
                                {formatDate(startDate)}
                            </span>
                        </div>
                        <div className="form-group">
                            <label>End Date</label>
                            <Controller
                                name="endDate"
                                control={control}
                                render={({ field }) => (
                                    <CustomDatePicker
                                        minDate={startDate}
                                        selected={field.value}
                                        onChange={handleDateChange}
                                        placeholder="Select end date"
                                    />
                                )}
                            />
                            <span
                                className={`input-error-message ${errors.endDate ? 'visible' : ''}`}
                            >
                                {errors.endDate?.message}
                            </span>
                        </div>
                        <div className="form-footer">
                            <CustomButton type="primary" disabled={!isValid}>
                                Finish Sprint
                            </CustomButton>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default FinishSprintModal;
