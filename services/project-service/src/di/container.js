import { createContainer, asClass } from 'awilix';
import {
    BacklogRepository,
    ProjectRepository,
    ProjectRedisRepository,
    SprintRepository,
    SprintRedisRepository,
} from '../repositories/index.js';
import {
    BacklogService,
    ProjectService,
    SprintService,
} from '../services/index.js';
import {
    BacklogController,
    ProjectController,
    SprintController,
} from '../controllers/index.js';

const container = createContainer();

container.register({
    //Repositories
    backlogRepository: asClass(BacklogRepository).scoped(),
    sprintRepository: asClass(SprintRepository).scoped(),
    sprintRedisRepository: asClass(SprintRedisRepository).scoped(),
    projectRepository: asClass(ProjectRepository).scoped(),
    projectRedisRepository: asClass(ProjectRedisRepository).scoped(),

    //Services
    backlogService: asClass(BacklogService).scoped(),
    sprintService: asClass(SprintService).scoped(),
    projectService: asClass(ProjectService).scoped(),

    //Controller
    backlogController: asClass(BacklogController).scoped(),
    sprintController: asClass(SprintController).scoped(),
    projectController: asClass(ProjectController).scoped(),
});

export default container;
