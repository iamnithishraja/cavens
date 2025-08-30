import express from "express";
import { getClubEvents, deleteEvent, getEvent, updateEvent } from "../controllers/eventController";
import { isAuthenticated } from "../middleware/auth";
import { getFeaturedEvents } from "../controllers/eventController";

const eventRoute = express.Router();

// All routes require authentication
eventRoute.use(isAuthenticated);

// Get all events for the authenticated club
eventRoute.get("/club-events", getClubEvents);

// Get all featured events
eventRoute.get("/featured-events", getFeaturedEvents);


// Get a specific event for editing only applicable for the club 
eventRoute.get("/event/:eventId", getEvent);



// Update an event
eventRoute.put("/event/:eventId", updateEvent);

// Delete an event
eventRoute.delete("/event/:eventId", deleteEvent);

export default eventRoute;
