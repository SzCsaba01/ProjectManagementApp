import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { logger, corsOptions } from './src/config/index.js';
import proxyRoutes from './src/routes/proxy.route.js';
import { errorHandlerMiddleware } from './src/middlewares/index.js';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();

app.use(cookieParser());

app.use(cors(corsOptions()));
app.use(helmet());
app.use(
    morgan('combined', {
        stream: { write: (message) => logger.info(message.trim()) },
    }),
);
app.disable('x-powered-by');

proxyRoutes(app);

app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

const startServer = async () => {
    try {
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Error starting the server:', error);
        process.exit(1);
    }
};

startServer();

process.on('SIGINT', async () => {
    console.log('Received SIGINT. Shutting down...');
    try {
        console.log('Express server closed.');
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
});

process.on('SIGTERM', async () => {
    console.log('Received SIGTERM. Shutting down...');
    try {
        console.log('Express server closed.');
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
});
