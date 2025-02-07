import React from 'react';
import CustomIcon from '../icon/CustomIcon';
import './FileViewerModal.css';

const FileViewerModal = ({ file, onClose }) => {
    const isPDF =
        (typeof file === 'string' && file.includes('.pdf')) ||
        file.type === 'application/pdf';

    return (
        <div className="view-file-modal-overlay">
            <div className="view-file-modal-container">
                <div className="view-file-modal">
                    <div className="view-file-modal-header">
                        <CustomIcon
                            name="times"
                            size="large"
                            className="close-icon"
                            onClick={onClose}
                        />
                    </div>
                    <div className="view-file-modal-body">
                        {isPDF ? (
                            <embed
                                src={
                                    typeof file === 'string'
                                        ? file
                                        : URL.createObjectURL(file)
                                }
                                type="application/pdf"
                                className="view-file-modal-pdf"
                            />
                        ) : (
                            <img
                                src={
                                    typeof file === 'string'
                                        ? file
                                        : URL.createObjectURL(file)
                                }
                                alt={file.name}
                                className="view-file-modal-image"
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FileViewerModal;
