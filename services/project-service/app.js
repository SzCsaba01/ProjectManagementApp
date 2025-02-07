import express from 'express';
import dotenv from 'dotenv';
import { scopePerRequest } from 'awilix-express';
import { errorHandlerMiddleware } from './src/middlewares/index.js';
import { corsOptions } from './src/config/index.js';
import cors from 'cors';
import {
    projectRoutes,
    backlogRoutes,
    sprintRoutes,
} from './src/routes/index.js';
import container from './src/di/container.js';

dotenv.config();

const app = express();

app.use(cors(corsOptions()));

app.use(express.json());

app.use(scopePerRequest(container));

app.use('/api/project', projectRoutes(container));
app.use('/api/backlog', backlogRoutes(container));
app.use('/api/sprint', sprintRoutes(container));

app.use(errorHandlerMiddleware);

export { app, container };
