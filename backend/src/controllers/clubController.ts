import type { Request, Response } from "express";
import Club from "../models/clubModel";
import eventModel from "../models/eventModel";
import { createEventSchema } from "../schemas/eventSchema";
import type { CustomRequest } from "../types";
import User from "../models/userModel";

export const createClub = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    if(!req.user){
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const {
      name,
      email,
      clubDescription,
      typeOfVenue,
      operatingDays,
      phone,
      address,
      mapLink,
      logoUrl,
      coverBannerUrl,
      photos,
    } = req.body;

    if (!name || !email || !clubDescription || !typeOfVenue || !Array.isArray(operatingDays) || !phone || !address || !mapLink) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }
     
    const club = await Club.create({
      name,
      email,
      clubDescription,
      typeOfVenue,
      operatingDays,
      phone,
      address,
      mapLink,
      logoUrl,
      coverBannerUrl,
      photos,
    });
    await User.findByIdAndUpdate(
      req.user._id, 
      { club: club._id }, 
      { new: true }
    );
    
    console.log(club);
    res.status(201).json({ success: true, club });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const saveEventData = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    // Validate request body using Zod
    const validationResult = createEventSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({ 
        success: false, 
        message: "Validation failed", 
        errors: validationResult.error.issues 
      });
      return;
    }

    const { events } = validationResult.data;
    const eventData = events[0]; // We only allow one event per request

    // Get clubId from the authenticated user
    if (!req.user || !req.user.club) {
      res.status(400).json({ success: false, message: "Club not associated with user" });
      return;
    }

    const clubId = req.user.club;

    // Check if club exists
    const club = await Club.findById(clubId);
    if (!club) {
      res.status(404).json({ success: false, message: "Club not found" });
      return;
    }

    // Create the event with clubId
    const event = await eventModel.create({
      ...eventData,
      clubId,
    });

    res.status(201).json({ 
      success: true, 
      message: "Event created successfully",
      data: event 
    });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


