import express from 'express';

const router = express.Router();

const authRoutes = (container) => {
    const authController = container.resolve('authController');

    //UPDATE
    router.put('/login', (req, res, next) =>
        authController.login(req, res, next),
    );
    router.get('/logout', (req, res, next) =>
        authController.logout(req, res, next),
    );
    router.get('/refresh-token', (req, res, next) =>
        authController.refreshToken(req, res, next),
    );

    return router;
};

export default authRoutes;
