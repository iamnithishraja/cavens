import express from 'express';
import { createClub, saveEventData } from '../controllers/clubController';
import { isAuthenticated } from '../middleware/auth';
import { isClub } from '../middleware/isClub';

const clubRoute = express.Router();

clubRoute.post('/', isAuthenticated, createClub); 
clubRoute.post('/event', isAuthenticated, isClub, saveEventData);

export default clubRoute;


