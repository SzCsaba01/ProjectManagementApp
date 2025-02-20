import express from 'express';

const router = express.Router();

const sprintRoutes = (container) => {
    const sprintController = container.resolve('sprintController');

    //CREATE
    router.post('/create-sprint-for-project', (req, res, next) =>
        sprintController.createSprintForProject(req, res, next),
    );

    //GET
    router.get('/get-sprint-by-id', (req, res, next) =>
        sprintController.getSprintById(req, res, next),
    );
    router.put('/get-sprints-by-ids', (req, res, next) =>
        sprintController.getSprintsByIds(req, res, next),
    );

    //UPDATE
    router.put('/update-sprint', (req, res, next) =>
        sprintController.updateSprint(req, res, next),
    );
    router.put('/finish-sprint', (req, res, next) =>
        sprintController.finishSprint(req, res, next),
    );

    //DELETE
    router.delete('/delete-sprint', (req, res, next) =>
        sprintController.deleteSprint(req, res, next),
    );

    return router;
};

export default sprintRoutes;
