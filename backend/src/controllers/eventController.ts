import type { Request, Response } from "express";
import eventModel from "../models/eventModel";
import Club from "../models/clubModel";
import type { CustomRequest } from "../types";
import z from "zod";
import clubModel from "../models/clubModel";

// Validation schemas
const eventSchema = z.object({
  name: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
  djArtists: z.string().optional(),
  description: z.string().min(1),
  coverImage: z.string().optional(),

  tickets: z.array(z.object({
    name: z.string().min(1),
    price: z.preprocess((val) => Number(val), z.number().positive()),
    description: z.string().optional(),
    quantityAvailable: z.preprocess((val) => Number(val), z.number().int().nonnegative()),
    
  })),

  menuItems: z.array(z.object({
    name: z.string().min(1),
    price: z.preprocess((val) => Number(val), z.number().positive()),
    description: z.string().optional(),
    category: z.string().optional(),
    itemImage: z.string().optional(),
  })).optional(),

  guestExperience: z.object({
    dressCode: z.string().optional(),
    entryRules: z.string().optional(),
    tableLayoutMap: z.string().optional(),
    parkingInfo: z.string().optional(),
    accessibilityInfo: z.string().optional(),
  }).optional(),

  happyHourTimings: z.string().optional(),
  galleryPhotos: z.array(z.string()).optional(),
  promoVideos: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

// Get all events for a club
export const getClubEvents = async (req: CustomRequest, res: Response) => {
  try {
    if (!req.user) {
       res.status(401).json({ success: false, message: "User not authenticated" });
       return;
    }

    // Find the club associated with the user
    console.log(req.user);
    const club = await Club.findById(req.user.club).populate({
        path: "events",
        options: { sort: { date: 1 } },
      });
      
      if (!club) {
         res.status(404).json({ success: false, message: "Club not found" });
         return;
        }
      
      res.json({
        success: true,
        data: club.events,
        total: club.events.length,
      });
      return;
  } catch (error) {
    console.error("Error fetching club events:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Delete an event
export const deleteEvent = async (req: CustomRequest, res: Response) => {
  try {
    if (!req.user) {
       res.status(401).json({ success: false, message: "User not authenticated" });
       return;
    }

    const eventId = req.params.eventId;

    
    const club = await Club.findOne(req.user.club);
    if (!club) {
       res.status(404).json({ success: false, message: "Club not found" });
       return;
    }

    
    const event = await eventModel.findOneAndDelete({ 
      _id: eventId,
    });

    if (!event) {
       res.status(404).json({ success: false, message: "Event not found" });
       return;
    }

    res.json({
      success: true,
      message: "Event deleted successfully"
    });
    return;
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getEvent = async (req: CustomRequest, res: Response) => {
  try {
    if (!req.user) {
       res.status(401).json({ success: false, message: "User not authenticated" });
       return;
    }

    const eventId  = req.params.eventId;
    console.log(eventId);
    if (!eventId) {
       res.status(400).json({ success: false, message: "Event ID is required" });
       return;
    }
    
    
    const club = await clubModel.findById(req.user.club );
    if (!club) {
       res.status(404).json({ success: false, message: "Club not found" });
       return;
    }

    // Ensure this event belongs to the club
    const isEventBelongs = club.events.some(
      (ev) => ev.toString() === eventId
    );
    if (!isEventBelongs) {
       res.status(404).json({ success: false, message: "Event not found for this club" });
       return;
    }

    // Fetch event details
    const event = await eventModel.findById(eventId);
    if (!event) {
       res.status(404).json({ success: false, message: "Event not found" });
       return;
    }

     res.json({
      success: true,
      data: event,
    });
    return;
  } catch (error) {
    console.error("Error fetching event:", error);
     res.status(500).json({ success: false, message: "Internal server error" });
     return;
  }
};



// Update an event
export const updateEvent = async (req: CustomRequest, res: Response) => {
  try {
    if (!req.user) {
       res.status(401).json({ success: false, message: "User not authenticated" });
       return;
    }

    const eventId = req.params.eventId;
    const eventData = req.body.eventData;
    // Validate request body
    const validatedData = eventSchema.parse(eventData);

    // Find the club associated with the user
    const club = await Club.findOne(req.user.club);
    if (!club) {
       res.status(404).json({ success: false, message: "Club not found" });
       return;
    }

    // Find and update the event (ensure it belongs to this club)
    const event = await eventModel.findOneAndUpdate(
      { _id: eventId },
      { ...validatedData },
      { new: true }
    );

    if (!event) {
       res.status(404).json({ success: false, message: "Event not found" });
       return;
    }

    res.json({
      success: true,
      message: "Event updated successfully",
      data: event
    });
    return;
  } catch (error) {
    console.error("Error updating event:", error);
    if (error instanceof z.ZodError) {
       res.status(400).json({ 
        success: false, 
        message: "Validation error", 
        errors: error.issues 
      });
      return;
    }
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
