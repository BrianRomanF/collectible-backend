import express from 'express';
import userController from '../controllers/userController.js';
import { authenticate } from '../firebase.js';

const userRouter = express.Router();

// Express Middleware for Firebase Authentication
userRouter.use(authenticate);

// Create User endpoint without authentication
userRouter.post('/createUser', userController.createUser);


export default userRouter;
