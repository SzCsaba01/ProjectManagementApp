import express from 'express';

const router = express.Router();

const sprintRoutes = (container) => {
    const sprintController = container.resolve('sprintController');

    //CREATE
    router.post('/create-sprint-for-project', (req, res, next) =>
        sprintController.createSprintForProject(req, res, next),
    );

    //GET

    //UPDATE
    router.put('/update-sprint', (req, res, next) =>
        sprintController.updateSprint(req, res, next),
    );
    router.put('finish-sprint', (req, res, next) =>
        sprintController.finishSprint(req, res, next),
    );

    //DELETE

    return router;
};

export default sprintRoutes;
