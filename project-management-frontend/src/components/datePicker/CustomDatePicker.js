import './CustomDatePicker.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { forwardRef } from 'react';

const CustomDatePicker = forwardRef(
    (
        {
            selected,
            minDate = undefined,
            placeholder,
            onChange,
            className = '',
            disabled = false,
        },
        ref,
    ) => {
        const customClass = `${className} custom-date-picker`;
        return (
            <DatePicker
                ref={ref}
                selected={selected}
                onChange={onChange}
                isClearable
                placeholder={placeholder}
                minDate={minDate}
                className={customClass}
                disabled={disabled}
            />
        );
    },
);

export default CustomDatePicker;
