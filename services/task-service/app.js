import express from 'express';
import dotenv from 'dotenv';
import { scopePerRequest } from 'awilix-express';
import container from './src/di/container.js';
import taskRoutes from './src/routes/task.route.js';
import errorHandlerMiddleware from './src/middlewares/errorHandler.middleware.js';
import path from 'path';

dotenv.config();

const app = express();

app.use(express.json());

app.use(scopePerRequest(container));

app.use('/api/task', taskRoutes(container));

app.use('/resources', express.static(path.join(process.cwd(), 'resources')));

app.use(errorHandlerMiddleware);

export { app, container };
