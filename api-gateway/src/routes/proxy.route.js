import { createProxyMiddleware } from 'http-proxy-middleware';
import { routes, rateLimiter } from '../config/index.js';
import {
    authorizationMiddleware,
    authenticationMiddleware,
} from '../middlewares/index.js';

const proxyRoutes = (app) => {
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
    });
};

export default proxyRoutes;
