import type { Request, Response } from "express";
import eventModel from "../models/eventModel";
import ticketModel from "../models/ticketModel";
import MenuItem from "../models/menuItemSchema";
import Club from "../models/clubModel";
import type { CustomRequest } from "../types";
import z from "zod";
import clubModel from "../models/clubModel";
import { calculateDistanceFromMapsLink } from "../utils/mapsDistanceCalculator";
import orderModel from "../models/orderModel";
import User from "../models/userModel";

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
      
      // Populate tickets and menuItems for events
      const eventIds = club.events.map((ev: any) => ev._id);
      const populatedEvents = await eventModel.find({ _id: { $in: eventIds } })
        .sort({ date: 1 })
        .populate("tickets")
        .populate("menuItems");

      res.json({
        success: true,
        data: populatedEvents,
        total: populatedEvents.length,
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
    const event = await eventModel.findById(eventId).populate("tickets").populate("menuItems");
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
    const eventData = req.body.eventData || {};

    // Normalize potentially stringified arrays coming from clients
    let rawTickets: any = (eventData as any).tickets;
    let rawMenuItems: any = (eventData as any).menuItems;
    if (typeof rawTickets === "string") {
      try { rawTickets = JSON.parse(rawTickets); } catch { rawTickets = undefined; }
    }
    if (typeof rawMenuItems === "string") {
      try { rawMenuItems = JSON.parse(rawMenuItems); } catch { rawMenuItems = undefined; }
    }

    // Validate only the non-nested fields; we'll handle tickets/menuItems separately
    const { tickets: _t, menuItems: _m, ...restEventData } = eventData as any;
    const validatedData = (eventSchema as any).omit({ tickets: true, menuItems: true }).partial().parse(restEventData);

    // Find the club associated with the user
    const club = await Club.findOne(req.user.club);
    if (!club) {
       res.status(404).json({ success: false, message: "Club not found" });
       return;
    }

    // Prepare update fields excluding tickets/menuItems to handle refs separately
    const { ...rest } = validatedData as any;

    const updateFields: any = { ...rest };

    // Handle tickets: create docs if objects provided; accept ids if provided
    if (Array.isArray(rawTickets)) {
      if (rawTickets.length > 0 && typeof rawTickets[0] === "object" && rawTickets[0] !== null && ("name" in rawTickets[0])) {
        const createdTickets = await Promise.all(
          rawTickets.map(async (t: any) => {
            const doc = await ticketModel.create({
              name: t.name,
              price: Number(t.price),
              description: t.description || "",
              quantityAvailable: Number(t.quantityAvailable) || 0,
            });
            return doc._id;
          })
        );
        updateFields.tickets = createdTickets;
      } else {
        // Assume tickets are ids/strings
        updateFields.tickets = rawTickets as any[];
      }
    }

    // Handle menuItems similarly
    if (Array.isArray(rawMenuItems)) {
      if (rawMenuItems.length > 0 && typeof rawMenuItems[0] === "object" && rawMenuItems[0] !== null && ("name" in rawMenuItems[0])) {
        const createdMenuItems = await Promise.all(
          rawMenuItems.map(async (m: any) => {
            const doc = await MenuItem.create({
              name: m.name,
              price: m.price?.toString?.() ?? String(m.price ?? ''),
              description: m.description || "",
              category: m.category,
              itemImage: m.itemImage || "",
              customCategory: m.customCategory || "",
            });
            return doc._id;
          })
        );
        updateFields.menuItems = createdMenuItems;
      } else {
        updateFields.menuItems = rawMenuItems as any[];
      }
    }

    // Find and update the event (ensure it belongs to this club)
    const event = await eventModel.findOneAndUpdate(
      { _id: eventId },
      { $set: updateFields },
      { new: true }
    ).populate("tickets").populate("menuItems");

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

export const getFeaturedEvents = async (req: CustomRequest, res: Response) => {
  try {
    const { latitude, longitude, city } = req.query;
    console.log("Fetching featured events with location:", { latitude, longitude, city });
    
    // Get featured events
    const baseQuery: any = { isFeatured: true };
    if (city) {
      // Filter only events whose clubs are in this city
      const clubsInCity = await clubModel.find({ city: { $regex: new RegExp(`^${city}$`, 'i') } }, { _id: 1 });
      const clubIds = clubsInCity.map(c => c._id.toString());
      if (clubIds.length) {
        const clubEvents = await clubModel.find({ _id: { $in: clubIds } }, { events: 1 });
        const allowedEventIds = clubEvents.flatMap(c => c.events);
        baseQuery._id = { $in: allowedEventIds };
      }
    }
    const events = await eventModel
      .find(baseQuery)
      .sort({ featuredNumber: 1 }) 
      .limit(3)
      .populate("tickets")
      .populate("menuItems"); 

    console.log("Featured events found:", events.length);

    // If no location provided, return events without distance calculation
    if (!latitude || !longitude) {
      console.log("No location provided for featured events, returning without distances");
      res.json({ success: true, data: events });
      return;
    }

    const userLat = parseFloat(latitude as string);
    const userLng = parseFloat(longitude as string);

    if (isNaN(userLat) || isNaN(userLng)) {
      console.log("Invalid coordinates for featured events, returning without distances");
      res.json({ success: true, data: events });
      return;
    }

    // For featured events, we need to find their associated clubs
    // Since events might not have direct club references, we'll find clubs that have these events
    const clubsWithEvents = await clubModel.find({
      events: { $in: events.map(event => event._id) }
    });

    console.log("Clubs with featured events found:", clubsWithEvents.length);

    // Calculate distances for featured events
    const distancePromises = events.map(async (event) => {
      try {
        // Find the club that contains this event
        const associatedClub = clubsWithEvents.find(club => 
          club.events.some(eventId => eventId.toString() === event._id.toString())
        );

        if (!associatedClub || !associatedClub.mapLink) {
          console.log(`No club or mapLink found for event ${event.name}`);
          return {
            ...event.toObject(),
            distanceText: "N/A",
            distanceInMeters: Number.MAX_VALUE
          };
        }

        const distanceResult = await calculateDistanceFromMapsLink(
          userLat,
          userLng,
          associatedClub.mapLink,
          process.env.GOOGLE_MAPS_API_KEY || "",
          "driving",
          true // use fallback
        );

        // Check if it's a Google Maps result or Haversine fallback
        if ('duration' in distanceResult.distance) {
          // Google Maps API result
          return {
            ...event.toObject(),
            distanceInMeters: distanceResult.distance.distance.value,
            distanceText: distanceResult.distance.distance.text,
            durationText: distanceResult.distance.duration.text,
            durationInSeconds: distanceResult.distance.duration.value,
            method: "Google Maps API",
            venue: associatedClub.name
          };
        } else {
          // Haversine fallback result
          return {
            ...event.toObject(),
            distanceInMeters: distanceResult.distance.distance.value,
            distanceText: distanceResult.distance.distance.text,
            durationText: "N/A",
            durationInSeconds: 0,
            method: distanceResult.distance.method,
            venue: associatedClub.name
          };
        }
      } catch (error) {
        console.warn(`Failed to calculate distance for featured event ${event.name}:`, error);
        return {
          ...event.toObject(),
          distanceText: "N/A",
          distanceInMeters: Number.MAX_VALUE
        };
      }
    });

    // Wait for all distance calculations to complete
    const eventsWithDistances = await Promise.all(distancePromises);
    
    // Sort by distance (closest first)
    eventsWithDistances.sort((a, b) => {
      const aDistance = a.distanceInMeters || Number.MAX_VALUE;
      const bDistance = b.distanceInMeters || Number.MAX_VALUE;
      return aDistance - bDistance;
    });

    console.log(`Calculated distances for ${eventsWithDistances.length} featured events`);
    res.json({ success: true, data: eventsWithDistances });
    return;
  } catch (error) {
    console.error("Error fetching featured events:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
    return;
  }
};

// Get event analytics
export const getEventAnalytics = async (req: CustomRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "User not authenticated" });
      return;
    }

    const eventId = req.params.eventId;
    if (!eventId) {
      res.status(400).json({ success: false, message: "Event ID is required" });
      return;
    }

    // Verify the event belongs to the club
    const club = await clubModel.findById(req.user.club);
    if (!club) {
      res.status(404).json({ success: false, message: "Club not found" });
      return;
    }

    const isEventBelongs = club.events.some(
      (ev) => ev.toString() === eventId
    );
    if (!isEventBelongs) {
      res.status(404).json({ success: false, message: "Event not found for this club" });
      return;
    }

    // Get event details
    const event = await eventModel.findById(eventId).populate("tickets");
    if (!event) {
      res.status(404).json({ success: false, message: "Event not found" });
      return;
    }

    // Get all orders for this event
    const orders = await orderModel.find({ event: eventId }).populate("ticket");
    
    // Calculate total sales
    const totalSales = orders.reduce((sum, order: any) => {
      return sum + (order.ticket.price * order.quantity);
    }, 0);

    // Calculate total tickets sold
    const totalTicketsSold = orders.reduce((sum, order: any) => sum + order.quantity, 0);

    // Calculate total revenue (only paid orders)
    const paidOrders = orders.filter((order: any) => order.status === "paid");
    const totalRevenue = paidOrders.reduce((sum, order: any) => {
      return sum + (order.ticket.price * order.quantity);
    }, 0);

    // Ticket type analysis
    const ticketTypeAnalysis: any = {};
    orders.forEach((order: any) => {
      const ticketName = order.ticket.name;
      if (!ticketTypeAnalysis[ticketName]) {
        ticketTypeAnalysis[ticketName] = {
          name: ticketName,
          price: order.ticket.price,
          quantitySold: 0,
          revenue: 0
        };
      }
      ticketTypeAnalysis[ticketName].quantitySold += order.quantity;
      ticketTypeAnalysis[ticketName].revenue += order.ticket.price * order.quantity;
    });

    // Get user demographics for this event
    // Note: We need to get users from the orders, but orders don't have user field directly
    // We'll need to get users who have orders for this event
    const users = await User.find({ orders: { $in: orders.map(order => order._id) } });

    // Age group analysis
    const ageGroupAnalysis = {
      "18-30": 0,
      "30-50": 0,
      "50+": 0
    };

    // Gender analysis
    const genderAnalysis = {
      "male": 0,
      "female": 0,
      "other": 0
    };

    users.forEach(user => {
      if (user.age) {
        ageGroupAnalysis[user.age] = (ageGroupAnalysis[user.age] || 0) + 1;
      }
      if (user.gender) {
        genderAnalysis[user.gender] = (genderAnalysis[user.gender] || 0) + 1;
      }
    });

    // Calculate percentages
    const totalUsers = users.length;
    const ageGroupPercentages: any = {};
    const genderPercentages: any = {};

    Object.keys(ageGroupAnalysis).forEach(age => {
      ageGroupPercentages[age] = totalUsers > 0 ? Math.round((ageGroupAnalysis[age as keyof typeof ageGroupAnalysis] / totalUsers) * 100) : 0;
    });

    Object.keys(genderAnalysis).forEach(gender => {
      genderPercentages[gender] = totalUsers > 0 ? Math.round((genderAnalysis[gender as keyof typeof genderAnalysis] / totalUsers) * 100) : 0;
    });

    // Convert ticket type analysis to array
    const ticketTypeArray = Object.values(ticketTypeAnalysis);

    // Calculate additional metrics
    const averageSpentPerCustomer = totalUsers > 0 ? Math.round(totalRevenue / totalUsers) : 0;
    const averageTicketsPerOrder = orders.length > 0 ? Math.round((totalTicketsSold / orders.length) * 100) / 100 : 0;
    const conversionRate = orders.length > 0 ? Math.round((paidOrders.length / orders.length) * 100) : 0;

    // Calculate ticket sales progression (cumulative sales over time)
    const sortedOrders = orders.sort((a: any, b: any) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    const salesProgression: Record<string, number> = {};
    let cumulativeSales = 0;
    
    // Group orders by day and calculate cumulative sales
    sortedOrders.forEach((order: any) => {
      const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
      if (orderDate) {
        cumulativeSales += order.ticket.price * order.quantity;
        salesProgression[orderDate] = cumulativeSales;
      }
    });

    // If no sales data, create a simple progression
    if (Object.keys(salesProgression).length === 0) {
      if (event.date) {
        const eventDate = new Date(event.date);
        const eventDateStr = eventDate.toISOString().split('T')[0];
        if (eventDateStr) {
          salesProgression[eventDateStr] = 0;
        }
      }
    }

    res.json({
      success: true,
      data: {
        event: {
          _id: event._id,
          name: event.name,
          date: event.date,
          time: event.time
        },
        sales: {
          totalSales,
          totalRevenue,
          totalTicketsSold,
          totalOrders: orders.length,
          paidOrders: paidOrders.length,
          averageSpentPerCustomer,
          averageTicketsPerOrder,
          conversionRate
        },
        ticketTypes: ticketTypeArray,
        salesProgression: salesProgression,
        demographics: {
          ageGroups: {
            data: ageGroupAnalysis,
            percentages: ageGroupPercentages
          },
          gender: {
            data: genderAnalysis,
            percentages: genderPercentages
          },
          totalUsers
        }
      }
    });

  } catch (error) {
    console.error("Error fetching event analytics:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
