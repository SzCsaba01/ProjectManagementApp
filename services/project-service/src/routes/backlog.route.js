import express from 'express';

const router = express.Router();

const backlogRoutes = (container) => {
    const backlogController = container.resolve('backlogController');
    return router;
};

export default backlogRoutes;
