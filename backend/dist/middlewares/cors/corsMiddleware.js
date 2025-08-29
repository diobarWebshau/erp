import cors from 'cors';
const ACCEPTED_ORIGINS = new Set([
    'http://localhost:3003',
    'http://localhost:5173',
    'http://localhost:5174',
]);
const corsOptions = {
    origin: (origin, callback) => {
        console.log(origin);
        if (!origin || ACCEPTED_ORIGINS.has(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed: You aren\'t authorized to access this service.'), false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
    credentials: true,
};
const corsMiddleware = cors(corsOptions);
export default corsMiddleware;
