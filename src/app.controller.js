import express from 'express';
import checkConnection from './DB/connectionDB.js';
// import userModel from './DB/models/user.model.js';
import cors from "cors" // to allow frontend or google service to connect my backend like sign in with google
import { PORT } from '../config/config.service.js';
import userRouter from './modules/user/user.controller.js';
const app = express()
const port = PORT


const bootstrap = () => {
    app.use(cors(), express.json())
    app.get('/', (req, res) => res.send('Hello World!'))
    // userModel

    app.use("/users", userRouter)

    checkConnection()
    app.use("{/*demo}", (req) => {
        throw new Error(`Route ${req.originalUrl} not found`, { cause: 404 });
        // console.log(`Route ${req.originalUrl} not found`);

    })

    app.use((err, req, res, next) => {
        res.status(err.cause || 500).json({ message: "server error", error: err.message })
    })
    app.listen(port, () => console.log(`Example app listening on port ${port}!`))
}

export default bootstrap;