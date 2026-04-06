import express from 'express';
import checkConnection from './DB/connectionDB.js';
import { connectionRedis, redis_client } from './DB/redis/redis.connection.js';
// import userModel from './DB/models/user.model.js';
import cors from "cors" // to allow frontend or google service to connect my backend like sign in with google
import { PORT } from '../config/config.service.js';
import userRouter from './modules/user/user.controller.js';
import messageRouter from './modules/messages/messages.controller.js';
const app = express()
const port = PORT


const bootstrap = () => {
    app.use(cors(), express.json())
    app.get('/', (req, res) => res.send('Hello World!'))
    // userModel

    app.use("/users", userRouter)
    app.use("/messages", messageRouter)

    checkConnection()
    connectionRedis()
    app.use("{/*demo}", (req) => {
        throw new Error(`Route ${req.originalUrl} not found`, { cause: 404 });
        // console.log(`Route ${req.originalUrl} not found`);

    })

    app.use((err, req, res, next) => {
        const statusCode = err.cause || 500;
        let errorLocation;
        if (process.env.NODE_ENV === 'development' && err.stack) {
            const stackLines = err.stack.split('\n');
            const locationLine = stackLines.find(line => line.includes('src') && !line.includes('node_modules'));
            if (locationLine) {
                const match = locationLine.match(/\((.*)\)/) || [null, locationLine.trim()];
                errorLocation = match[1] || match[0];
            }
        }

        res.status(statusCode).json({
            status: statusCode,
            message: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
            location: errorLocation,
            path: req.originalUrl,
            method: req.method,
            timestamp: new Date().toISOString()
        });
    })
    app.listen(port, () => console.log(`Example app listening on port ${port}!`))
}

export default bootstrap;