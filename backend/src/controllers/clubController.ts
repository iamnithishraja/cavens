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
      city,
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
    // Ensure user has a club
    if (!req.user || !req.user.club) {
      res.status(400).json({ success: false, message: "Club not associated with user" });
      return;
    }

    const clubId = req.user.club;
    const club = await Club.findById(clubId);
    if (!club) {
      res.status(404).json({ success: false, message: "Club not found" });
      return;
    }

    const {
      name,
      date,
      time,
      description,
      coverImage,
      djArtists,
      tickets = [],
      menuItems = [],
      happyHourTimings = "",
      galleryPhotos = [],
      promoVideos = [],
      guestExperience = {},
    } = req.body;
     console.log(req.body);
    // Basic required fields check
    if (!name?.trim() || !date?.trim() || !time?.trim() || !description?.trim()) {
      res.status(400).json({ success: false, message: "Event name, date, time, and description are required" });
      return;
    }

    // Normalize tickets
    // Normalize tickets
const processedTickets = tickets.map((ticket: any) => ({
  name: ticket.name || ticket.type,  // <-- FIX: use name if available, fallback to type
  type: ticket.type,                 // keep type if schema has it
  price: Number(ticket.price),
  quantityAvailable: Number(ticket.quantityAvailable),
  description: ticket.description || "",
  soldCount: 0,
}));


    // Normalize menu items
    const processedMenuItems = menuItems.map((item: any) => ({
      name: item.name,
      price: item.price.toString(),
      description: item.description || "",
      category: item.category,
      itemImage: item.itemImage || "",
    }));

    // Create event
    const event = await eventModel.create({
      name: name.trim(),
      date: date.trim(),
      time: time.trim(),
      description: description.trim(),
      djArtists: djArtists || "",
      coverImage: coverImage || "",
      clubId,
    
      tickets: processedTickets,
      menuItems: processedMenuItems,
      happyHourTimings,
      galleryPhotos,
      promoVideos,
      guestExperience: {
        dressCode: guestExperience.dressCode || "",
        entryRules: guestExperience.entryRules || "",
        tableLayoutMap: guestExperience.tableLayoutMap || "",
        parkingInfo: guestExperience.parkingInfo || "",
        accessibilityInfo: guestExperience.accessibilityInfo || "",
      },
      isActive: true,
    });
    

    // Push event into club
    await Club.findByIdAndUpdate(clubId, { $push: { events: event._id } });

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: {
        id: event._id,
        name: event.name,
        date: event.date,
        time: event.time,
        ticketsCount: processedTickets.length,
        menuItemsCount: processedMenuItems.length,
      },
    });
  } catch (error: any) {
    console.error("Error creating event:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};



