import { createProxyMiddleware } from 'http-proxy-middleware';
import { routes, rateLimiter } from '../config/index.js';
import {
    authorizationMiddleware,
    authenticationMiddleware,
} from '../middlewares/index.js';
import createWebSocketProxy from '../utils/websocketProxy.js';

const proxyRoutes = (app, server) => {
    const routeList = routes();

    routeList.forEach((route) => {
        app.use(
            route.route,
            rateLimiter,
            authenticationMiddleware,
            authorizationMiddleware,
            createProxyMiddleware({
                target: route.url,
                changeOrigin: true,
                pathRewrite: {},
            }),
        );
        if (route.enableWebSocket) {
            createWebSocketProxy(server, route);
        }
    });
};

export default proxyRoutes;
