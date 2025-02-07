import { logger } from '../config/index.js';

const requestTimeout = (req, res, next) => {
    req.setTimeout(15000, () => {
        logger.warn(`Request timed out for ${req.method} ${req.originalUrl}`);
        res.status(504).json({
            code: 504,
            status: 'Error',
            message: 'Gateway timeout.',
            data: null,
        });
        req.abort();
    });
    next();
};

export default requestTimeout;
