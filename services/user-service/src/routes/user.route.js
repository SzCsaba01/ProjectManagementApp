import express from 'express';

const router = express.Router();

const userRoutes = (container) => {
    const userController = container.resolve('userController');

    //CREATE
    router.post('/register', (req, res, next) =>
        userController.register(req, res, next),
    );

    //GET
    router.get('/user-data', (req, res, next) =>
        userController.getUserData(req, res, next),
    );
    router.get('/get-managers', (req, res, next) =>
        userController.getManagers(req, res, next),
    );
    router.get('/get-all-users-for-project', (req, res, next) =>
        userController.getAllUsersForProject(req, res, next),
    );
    router.get('/get-users-paginated', (req, res, next) =>
        userController.getUsersPaginated(req, res, next),
    );
    router.get('/verify-password', (req, res, next) =>
        userController.verifyIfUserExistsByForgotPasswordToken(req, res, next),
    );
    router.get('/get-users-by-project-id', (req, res, next) =>
        userController.getUsersByProjectId(req, res, next),
    );

    //UPDATE
    router.put('/send-forgot-password-email', (req, res, next) =>
        userController.sendForgotPasswordEmail(req, res, next),
    );
    router.put('/change-password', (req, res, next) =>
        userController.changePassword(req, res, next),
    );
    router.get('/verify-email', (req, res, next) =>
        userController.verifyEmailByRegistrationToken(req, res, next),
    );
    router.put('/set-selected-project', (req, res, next) =>
        userController.setSelectedProject(req, res, next),
    );

    //DELETE
    router.delete('/delete-user', (req, res, next) =>
        userController.deleteUser(req, res, next),
    );
    return router;
};

export default userRoutes;
