import rateLimit from 'express-rate-limit';

const rateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    message: {
        code: 429,
        status: 'Error',
        message: 'Rate limit exceeded.',
        data: null,
    },
});

export default rateLimiter;
