import express from 'express';
import { authenticate } from '../firebase.js';
const testRouter = express.Router();

// Use authentication middleware only for this route
testRouter.get('/test', authenticate, (req, res) => {
    res.send('Testing authentication');
  });



export default testRouter;