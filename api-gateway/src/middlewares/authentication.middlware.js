import jwt from 'jsonwebtoken';
import { publicRoutes } from '../config/index.js';

const authenticationMiddleware = (req, res, next) => {
    if (publicRoutes.includes(req.path)) {
        return next();
    }

    const token = req.cookies?.accessToken;

    if (!token) {
        return res.status(401).json({
            errorCode: 'TOKEN_MISSING',
            status: 'Error',
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({
                    code: 401,
                    status: 'Error',
                });
            }

            return res.status(403).json({
                code: 403,
                status: 'Error',
            });
        }

        req.decodedAccessToken = decoded;
        return next();
    });
};

export default authenticationMiddleware;
