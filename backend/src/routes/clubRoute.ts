import express from 'express';
import { createClub, saveManagerData } from '../controllers/clubController';

const clubRoute = express.Router();

clubRoute.post('/', createClub);
clubRoute.post('/manager', saveManagerData);

export default clubRoute;


