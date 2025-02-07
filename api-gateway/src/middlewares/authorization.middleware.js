import { publicRoutes, protectedRoutes } from '../config/index.js';

const authorizationMiddleware = (req, res, next) => {
    if (publicRoutes.includes(req.path)) {
        return next();
    }

    const { roles = [], permissions = [] } = protectedRoutes[req.path] || {};

    if (roles.length === 0 && permissions.length === 0) {
        return next();
    }

    const userRoles = req.decodedAccessToken?.roles || [];
    const userPermissions = req.decodedAccessToken?.permissions || [];

    const hasRole =
        !roles.length || roles.some((role) => userRoles.includes(role));

    const hasPermission =
        !permissions.length ||
        permissions.every((permission) =>
            userPermissions.some(
                (userPerm) =>
                    userPerm.resource === permission.resource &&
                    userPerm.action === permission.action,
            ),
        );

    if (!hasRole || !hasPermission) {
        console.log('test');
        return res.status(403).json({
            code: 403,
            status: 'Error',
        });
    }

    console.log(req.path);

    return next();
};

export default authorizationMiddleware;
