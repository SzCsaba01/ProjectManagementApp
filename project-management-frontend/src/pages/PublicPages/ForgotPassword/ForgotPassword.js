import { yupResolver } from '@hookform/resolvers/yup';
import CustomButton from '../../../components/button/CustomButton';
import CustomInput from '../../../components/input/CustomInput';
import CustomIcon from '../../../components/icon/CustomIcon';
import { forgotPassword } from '../../../services/user.service';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import './ForgotPassword.css';

const ForgotPassword = () => {
    const validationSchema = Yup.object({
        email: Yup.string()
            .email('Invalid email format')
            .required('Email is required'),
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(validationSchema),
        mode: 'onChange',
    });

    const onSubmit = async (data) => {
        await forgotPassword(data.email);
    };

    return (
        <div className="forgot-password public-page-content">
            <div className="link-navigate">
                <Link to="/login" className="link-button">
                    <CustomIcon name="arrow-left" size="small" /> Back to Login
                </Link>
            </div>
            <h1>Forgot Password</h1>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="form-group">
                    <CustomInput
                        type="email"
                        label="Email"
                        error={errors.email}
                        {...register('email')}
                    />
                    <span
                        className={`input-error-message ${errors.email ? 'visible' : ''}`}
                    >
                        {errors.email?.message}
                    </span>
                </div>
                <CustomButton type="primary">
                    <CustomIcon name="envelope" size="small" />
                    Reset Password
                </CustomButton>
            </form>
        </div>
    );
};
export default ForgotPassword;
