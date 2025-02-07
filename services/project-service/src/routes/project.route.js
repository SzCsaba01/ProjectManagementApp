import express from 'express';

const router = express.Router();

const projectRoutes = (container) => {
    const projectController = container.resolve('projectController');

    //CREATE
    router.post('/create-project', (req, res, next) =>
        projectController.createProject(req, res, next),
    );

    //GET
    router.get('/get-all-projects', (req, res, next) =>
        projectController.getAllProjects(req, res, next),
    );
    router.get('/get-project-by-project-id', (req, res, next) =>
        projectController.getProjectByProjectId(req, res, next),
    );
    router.get('/get-projects-by-member-id', (req, res, next) =>
        projectController.getProjectsByMemberId(req, res, next),
    );
    router.get('/get-projects-by-owner-id', (req, res, next) =>
        projectController.getProjectsByOwnerId(req, res, next),
    );

    //UPDATE
    router.put('/update-project', (req, res, next) =>
        projectController.updateProject(req, res, next),
    );

    //DELETE
    router.delete('/delete-project', (req, res, next) =>
        projectController.deleteProject(req, res, next),
    );

    return router;
};

export default projectRoutes;
