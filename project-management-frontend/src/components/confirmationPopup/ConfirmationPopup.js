import React from 'react';
import CustomButton from '../button/CustomButton';
import './ConfirmationPopup.css';

const ConfirmationPopup = ({ message, onCancel, onConfirm }) => {
    return (
        <div className="confirmation-popup-overlay">
            <div className="confirmation-popup">
                <h3>{message}</h3>
                <div className="confirmation-buttons">
                    <CustomButton type="danger" onClick={onCancel}>
                        Cancel
                    </CustomButton>
                    <CustomButton type="primary" onClick={onConfirm}>
                        Confirm
                    </CustomButton>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationPopup;
