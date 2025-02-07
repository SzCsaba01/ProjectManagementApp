const routes = () => {
    return [
        {
            route: '/api/auth',
            url: process.env.AUTH_ROUTE_URL,
        },
        {
            route: '/api/user',
            url: process.env.USER_ROUTE_URL,
        },
        {
            route: '/api/user-profile',
            url: process.env.USER_PROFILE_ROUTE_URL,
        },
        {
            route: '/api/project',
            url: process.env.PROJECT_ROUTE_URL,
        },
        {
            route: '/api/sprint',
            url: process.env.SPRINT_ROUTE_URL,
        },
        {
            route: '/api/backlog',
            url: process.env.BACKLOG_ROUTE_URL,
        },
        {
            route: '/api/task',
            url: process.env.TASK_ROUTE_URL,
        },
    ];
};

export default routes;
