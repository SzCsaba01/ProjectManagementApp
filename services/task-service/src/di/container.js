import { createContainer, asClass } from 'awilix';
import { TaskRedisRepository, TaskRepository } from '../repositories/index.js';
import { TaskService } from '../services/index.js';
import { TaskController } from '../controllers/index.js';

const container = createContainer();

container.register({
    //Repositories
    taskRepository: asClass(TaskRepository).scoped(),
    taskRedisRepository: asClass(TaskRedisRepository).scoped(),

    //Services
    taskService: asClass(TaskService).scoped(),

    //Controller
    taskController: asClass(TaskController).scoped(),
});

export default container;
