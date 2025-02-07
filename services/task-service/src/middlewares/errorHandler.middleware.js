import { CustomError } from '../errors/index.js';

const errorHandlerMiddleware = (err, _req, res, _next) => {
    console.error(err);
    if (err instanceof CustomError) {
        return res.status(err.statusCode).json({
            error: {
                message: err.message,
            },
        });
    }

    return res.status(500).json({
        error: {
            message: 'Something went wrong! Please try again later!',
        },
    });
};

export default errorHandlerMiddleware;
