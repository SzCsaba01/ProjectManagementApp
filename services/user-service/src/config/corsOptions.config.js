const corsOptions = () => {
    return {
        origin: [process.env.API_GATEWAY_URL],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    };
};

export default corsOptions;
