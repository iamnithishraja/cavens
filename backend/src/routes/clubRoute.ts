import express from 'express';
import { createClub, saveEventData } from '../controllers/clubController';

const clubRoute = express.Router();

clubRoute.post('/', createClub); 
clubRoute.post('/event', saveEventData);

export default clubRoute;


