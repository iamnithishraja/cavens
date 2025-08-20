import express from 'express';
import { createClub } from '../controllers/clubController';

const clubRoute = express.Router();

clubRoute.post('/', createClub);

export default clubRoute;


