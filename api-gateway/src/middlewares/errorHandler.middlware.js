import { logger } from '../config/index.js';

const errorHandlerMiddleware = (err, _req, res, _next) => {
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    logger.error(`Error occured: ${message}`, { stack: err.stack });
    res.status(status).json({ code: status, status: 'Error', message });
};

export default errorHandlerMiddleware;
