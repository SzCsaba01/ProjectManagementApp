import express from 'express';
import { formDataAndFileUploadHandlerMiddleware } from '../middlewares/index.js';

const router = express.Router();

const userProfileRoutes = (container) => {
    const userProfileController = container.resolve('userProfileController');

    //UPDATE
    router.put(
        '/update-user-profile',
        formDataAndFileUploadHandlerMiddleware('single', 'avatar'),
        (req, res, next) =>
            userProfileController.updateUserProfile(req, res, next),
    );

    return router;
};

export default userProfileRoutes;
