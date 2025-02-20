import React, { forwardRef } from 'react';
import Select from 'react-select';
import './CustomSelect.css';

const CustomSelect = forwardRef(
    (
        {
            options,
            isMulti,
            placeholder,
            value,
            onChange,
            name,
            className = '',
            disabled = false,
        },
        ref,
    ) => {
        const customStyles = {
            control: (provided, state) => ({
                ...provided,
                backgroundColor: 'var(--white-color)',
                borderColor: state.isFocused
                    ? 'var(--primary-hover)'
                    : 'var(--light-gray-color)',
                boxShadow: state.isFocused
                    ? '0 0 0 1px var(--primary-hover)'
                    : 'none',
                '&:hover': {
                    borderColor: 'var(--primary-hover)',
                },
            }),
            option: (provided) => ({
                ...provided,
                backgroundColor: 'var(--white-color)',
                color: 'var(--black-color)',
                '&:hover': {
                    backgroundColor: 'rgba(26, 188, 156, 0.4)',
                },
            }),
            multiValue: (provided) => ({
                ...provided,
                backgroundColor: 'var(--primary-color)',
                color: 'white',
            }),
            multiValueLabel: (provided) => ({
                ...provided,
                color: 'white',
            }),
            multiValueRemove: (provided) => ({
                ...provided,
                color: 'white',
                '&:hover': {
                    backgroundColor: 'var(--secondary-hover)',
                    color: 'white',
                },
            }),
            menu: (provided) => ({
                ...provided,
                maxHeight: '10rem',
                overflowY: 'auto',
            }),
            menuList: (provided) => ({
                ...provided,
                maxHeight: '10rem',
                overflowY: 'auto',
            }),
        };

        return (
            <Select
                ref={ref}
                name={name}
                options={options}
                isMulti={isMulti}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                styles={customStyles}
                isClearable
                isSearchable={false}
                className={className}
                isDisabled={disabled}
            />
        );
    },
);

export default CustomSelect;
