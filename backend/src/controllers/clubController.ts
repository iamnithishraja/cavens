import type { Request, Response } from "express";
import Club from "../models/clubModel";
import { calculateDistanceFromMapsLink } from "../utils/mapsDistanceCalculator";
import eventModel from "../models/eventModel";
import { createEventSchema } from "../schemas/eventSchema";
import type { CustomRequest } from "../types";
import User from "../models/userModel";
import ticketModel from "../models/ticketModel";
import MenuItem from "../models/menuItemSchema";
import orderModel from "../models/orderModel";

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

    if (!name || !email || !clubDescription || !typeOfVenue || !Array.isArray(operatingDays) || !phone || !address || !mapLink || !city) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }
     
    const club = await Club.create({
      owner: req.user._id,
      name,
      email,
      clubDescription,
      typeOfVenue,
      operatingDays,
      phone,
      address,
      mapLink,
      city,
      logoUrl,
      coverBannerUrl,
      photos,
    });
    // Set user.club to this club id
    await User.findByIdAndUpdate(req.user._id, { club: club._id }, { new: true });
    
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
      eventMap,
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
    if (!name?.trim() || !date?.trim() || !time?.trim() || !description?.trim() || !eventMap?.trim()) {
      res.status(400).json({ success: false, message: "Event name, date, time, description, and event map are required" });
      return;
    }

    // Create Ticket documents and collect their ObjectIds
    const ticketDocs = await Promise.all(
      (tickets || []).map(async (ticket: any) => {
        const doc = await ticketModel.create({
          name: ticket.name || ticket.type,
          price: Number(ticket.price),
          description: ticket.description || "",
          quantityAvailable: Number(ticket.quantityAvailable),
        });
        return doc._id;
      })
    );

    // Create MenuItem documents and collect their ObjectIds
    const menuItemDocs = await Promise.all(
      (menuItems || []).map(async (item: any) => {
        const doc = await MenuItem.create({
          name: item.name,
          price: item.price?.toString?.() ?? String(item.price ?? ''),
          description: item.description || "",
          category: item.category,
          itemImage: item.itemImage || "",
          customCategory: item.customCategory || "",
        });
        return doc._id;
      })
    );

    // Create event
    const event = await eventModel.create({
      name: name.trim(),
      date: date.trim(),
      time: time.trim(),
      description: description.trim(),
      djArtists: djArtists || "",
      coverImage: coverImage || "",
      eventMap: eventMap || "",
      clubId,
      tickets: ticketDocs,
      menuItems: menuItemDocs,
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
        ticketsCount: ticketDocs.length,
        menuItemsCount: menuItemDocs.length,
      },
    });
  } catch (error: any) {
    console.error("Error creating event:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


// Get approved clubs with optional filters, and optionally include active events
export const listApprovedClubs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { city, type, includeEvents } = req.query as { city?: string; type?: string; includeEvents?: string };
    const filter: any = { isApproved: true };
    if (city) filter.city = { $regex: new RegExp(`^${city}$`, 'i') };
    if (type) {
      // Accept both "Pool Club" and "pool_club" style inputs
      const flexible = type.replace(/_/g, '[ _]+');
      filter.typeOfVenue = { $regex: new RegExp(`(^|,)\\s*${flexible}\\s*(,|$)`, 'i') };
    }

    const query = Club.find(filter).sort({ createdAt: -1 });
    if (includeEvents === 'true') {
      query.populate({ 
        path: 'events', 
        match: { status: { $in: ['active'] } },
        populate: [
          { path: 'tickets' },
          { path: 'menuItems' }
        ]
      });
    }
    const clubs = await query.exec();
    res.status(200).json({ success: true, items: clubs });
  } catch (error) {
    console.error('Error listing approved clubs:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// List approved clubs with computed distance based on user's location
export const listApprovedClubsWithDistance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { latitude, longitude, city, type } = req.query as { latitude?: string; longitude?: string; city?: string; type?: string };

    if (!latitude || !longitude) {
      res.status(400).json({ success: false, message: 'latitude and longitude are required' });
      return;
    }

    const userLat = parseFloat(latitude);
    const userLng = parseFloat(longitude);
    if (!isFinite(userLat) || !isFinite(userLng)) {
      res.status(400).json({ success: false, message: 'invalid latitude/longitude' });
      return;
    }

    const filter: any = { isApproved: true };
    if (city) filter.city = { $regex: new RegExp(`^${city}$`, 'i') };
    if (type) {
      const flexible = type.replace(/_/g, '[ _]+');
      filter.typeOfVenue = { $regex: new RegExp(`(^|,)\s*${flexible}\s*(,|$)`, 'i') };
    }

    const clubs = await Club.find(filter).sort({ createdAt: -1 });

    const apiKey = process.env.GOOGLE_MAPS_API_KEY || '';
    const results = await Promise.all(
      clubs.map(async (club) => {
        if (!club.mapLink) {
          return {
            club,
            distanceInMeters: Number.MAX_VALUE,
            distanceText: 'N/A',
            durationText: 'N/A',
            durationInSeconds: 0,
            method: 'No map link available',
          };
        }

        try {
          const distanceResult = await calculateDistanceFromMapsLink(
            userLat,
            userLng,
            club.mapLink,
            apiKey,
            'driving',
            true
          );

          if ('duration' in distanceResult.distance) {
            return {
              club,
              distanceInMeters: distanceResult.distance.distance.value,
              distanceText: distanceResult.distance.distance.text,
              durationText: distanceResult.distance.duration.text,
              durationInSeconds: distanceResult.distance.duration.value,
              method: 'Google Maps API',
            };
          } else {
            return {
              club,
              distanceInMeters: distanceResult.distance.distance.value,
              distanceText: distanceResult.distance.distance.text,
              durationText: 'N/A',
              durationInSeconds: 0,
              method: distanceResult.distance.method,
            };
          }
        } catch (err) {
          return {
            club,
            distanceInMeters: Number.MAX_VALUE,
            distanceText: 'N/A',
            durationText: 'N/A',
            durationInSeconds: 0,
            method: 'Distance calculation failed',
          };
        }
      })
    );

    results.sort((a, b) => a.distanceInMeters - b.distanceInMeters);

    res.status(200).json({ success: true, userLocation: { latitude: userLat, longitude: userLng }, clubs: results });
  } catch (error) {
    console.error('Error listing approved clubs with distance:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get single club details with events
export const getClubDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const club = await Club.findById(id).populate({ 
      path: 'events',
      populate: [
        { path: 'tickets' },
        { path: 'menuItems' }
      ]
    });
    if (!club) {
      res.status(404).json({ success: false, message: 'Club not found' });
      return;
    }
    res.status(200).json({ success: true, club });
  } catch (error) {
    console.error('Error getting club details:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// List distinct cities from existing clubs (for dynamic pickers)
export const listCities = async (req: Request, res: Response): Promise<void> => {
  try {
    const cities: string[] = await Club.distinct('city');
    // Normalize: trim, remove empties, unique case-insensitive
    const normalized = Array.from(
      new Map(
        cities
          .filter((c) => typeof c === 'string')
          .map((c) => (c as string).trim())
          .filter((c) => c.length > 0)
          .map((c) => [c.toLowerCase(), c])
      ).values()
    ).sort((a, b) => a.localeCompare(b));
    res.status(200).json({ success: true, items: normalized });
  } catch (error) {
    console.error('Error listing cities:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const completeOrder = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const { orderId } = req.body;
    
    if (!orderId) {
      res.status(400).json({ success: false, message: "Order ID is required" });
      return;
    }

    // First check if order exists and get its current status
    const existingOrder = await orderModel.findById(orderId);
    
    if (!existingOrder) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    // Check if order is already scanned
    if (existingOrder.status === "scanned") {
      res.status(400).json({ 
        success: false, 
        message: "Order has already been scanned"
      });
      return;
    }

    // Update order status to scanned and populate all related data in one query
    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId, 
      { 
        status: "scanned",
        updatedAt: new Date()
      }, 
      { new: true }
    ).populate([
      {
        path: 'event',
        select: 'name date time djArtists description coverImage guestExperience galleryPhotos promoVideos happyHourTimings status'
      },
      {
        path: 'ticket',
        select: 'name price description'
      },
      {
        path: 'club',
        select: 'name city typeOfVenue address phone'
      }
    ]);

    if (!updatedOrder) {
      res.status(500).json({ success: false, message: "Failed to update order" });
      return;
    }

    res.status(200).json({ 
      success: true, 
      message: "Order completed successfully",
      data: {
        order: updatedOrder,
        eventDetails: updatedOrder.event,
        ticketDetails: updatedOrder.ticket,
        clubDetails: updatedOrder.club,
        scanTime: new Date(),
        orderStatus: "completed"
      }
    });

  } catch (err) {
    console.error("Error completing order:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}


