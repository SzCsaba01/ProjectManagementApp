import express from 'express';
import dotenv from 'dotenv';
import { scopePerRequest } from 'awilix-express';
import { errorHandlerMiddleware } from './src/middlewares/index.js';
import { corsOptions } from './src/config/index.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import container from './src/di/container.js';
import {
    authRoutes,
    userRoutes,
    userProfileRoutes,
} from './src/routes/index.js';
import path from 'path';

dotenv.config();

const app = express();

app.use(cookieParser());

app.use(cors(corsOptions()));

app.use(express.json());

app.use(scopePerRequest(container));

app.use('/api/auth', authRoutes(container));
app.use('/api/user', userRoutes(container));
app.use('/api/user-profile', userProfileRoutes(container));

app.use('/resources', express.static(path.join(process.cwd(), 'resources')));

const scheduler = container.resolve('scheduler');

scheduler.start();

app.use(errorHandlerMiddleware);

export default app;
