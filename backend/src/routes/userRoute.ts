import express from 'express';
import { onboarding } from '../controllers/userController';

const userRoute = express.Router();

userRoute.post('/oboarding', onboarding);

export default userRoute;