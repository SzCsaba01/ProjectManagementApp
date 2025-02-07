import multer from 'multer';
import { ValidationError } from '../errors/index.js';

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            return cb(
                new ValidationError(
                    'Invalid file type. Only JPG, JPEG, PNG are allowed.',
                ),
            );
        }
        cb(null, true);
    },
});

const formDataAndFileUploadHandlerMiddleware = (
    uploadType = 'single',
    fieldName = 'avatar',
    maxFiles = 1,
) => {
    if (uploadType === 'single') {
        return upload.single(fieldName);
    } else if (uploadType === 'array') {
        return upload.array(fieldName, maxFiles);
    } else {
        throw new ValidationError(
            'Invalid uploadType. Use "single" or "array".',
        );
    }
};

export default formDataAndFileUploadHandlerMiddleware;
