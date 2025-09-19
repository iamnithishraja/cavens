import express from 'express';
import { createClub, saveEventData, listApprovedClubs, getClubDetails, completeOrder, listApprovedClubsWithDistance } from '../controllers/clubController';
import { isAuthenticated } from '../middleware/auth';
import { isClub } from '../middleware/isClub';

const clubRoute = express.Router();

clubRoute.post('/', isAuthenticated, createClub); 
clubRoute.post('/event', isAuthenticated, isClub, saveEventData);
// Public endpoints to fetch clubs and details
clubRoute.get('/public/approved', listApprovedClubs);
clubRoute.get('/public/approved-with-distance', listApprovedClubsWithDistance);
clubRoute.get('/public/:id', getClubDetails);

clubRoute.post('/completeOrder', isAuthenticated, isClub, completeOrder);

export default clubRoute;


