import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import FileViewerModal from '../fileViewerModal/FileViewerModal';
import CustomIcon from '../icon/CustomIcon';
import './CustomFileDropBox.css';

const CustomFileDropBox = ({ files, setFiles, disabled = false }) => {
    const [selectedFile, setSelectedFile] = useState(null);

    const onDrop = (acceptedFiles) => {
        if (acceptedFiles?.length) {
            const updatedFiles = [...files, ...acceptedFiles];
            setFiles(updatedFiles);
        }
    };

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png'],
            'application/pdf': ['.pdf'],
        },
    });

    const handleFileClick = (file, e) => {
        e.stopPropagation();
        setSelectedFile(file);
    };

    const handleRemoveFileClick = (index, e) => {
        e.stopPropagation();
        const updatedFiles = files.filter((_, i) => i !== index);
        setFiles(updatedFiles);
    };

    const closeModal = () => {
        setSelectedFile(null);
    };

    const preventDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    return (
        <>
            <div
                {...getRootProps()}
                onDragStart={preventDrag}
                className={`dropbox ${disabled ? 'disabled' : ''}`}
            >
                <input {...getInputProps()} disabled={disabled} />
                {!files?.length && !disabled && (
                    <p>Drag & Drop files here, or click to select files</p>
                )}
                <div className="file-previews">
                    {files?.map((file, index) => (
                        <div key={index} className="file-preview">
                            <div className="file-preview-content">
                                <CustomIcon
                                    name="xmark"
                                    size="large"
                                    className="remove-file-icon"
                                    onClick={(e) =>
                                        handleRemoveFileClick(index, e)
                                    }
                                />
                                {(typeof file === 'string' &&
                                    file.includes('.pdf')) ||
                                file.type === 'application/pdf' ? (
                                    <CustomIcon
                                        name="file-pdf"
                                        className="pdf-icon file-preview-item"
                                        onClick={(e) =>
                                            handleFileClick(file, e)
                                        }
                                    />
                                ) : (
                                    <img
                                        src={
                                            typeof file === 'string'
                                                ? file
                                                : URL.createObjectURL(file)
                                        }
                                        alt="preview"
                                        className="file-preview-item"
                                        onClick={(e) =>
                                            handleFileClick(file, e)
                                        }
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedFile && (
                <FileViewerModal file={selectedFile} onClose={closeModal} />
            )}
        </>
    );
};

export default CustomFileDropBox;
