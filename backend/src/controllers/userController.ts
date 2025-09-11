import clubModel from "../models/clubModel.js";
import axios from "axios";
import User from "../models/userModel";
import {
  onbooardingSchema,
  verifyOtpSchema,
} from "../schemas/onboardingSchema";
import { generateOTP } from "../utils/otp";
import { sendPhoneOtp } from "../utils/sms";
import type { Response, Request } from "express";
import z from "zod";
import { generateToken } from "../utils/token";
import { completeProfileSchema } from "../schemas/onboardingSchema";
import type { CustomRequest } from "../types";
import Club from "../models/clubModel";
import eventModel from "../models/eventModel";
import { calculateDistanceFromMapsLink } from "../utils/mapsDistanceCalculator";
import orderModel from "../models/orderModel";
import ticketModel from "../models/ticketModel";
import updateExpiredEvents from "../utils/updateEvent.js";

async function onboarding(req: Request, res: Response) {
  try {
    const { phone } = onbooardingSchema.parse(req.body);
    const user = await User.findOne({ phone: phone });
    if (!user) {
      const newUser = await User.create({ phone });
      const otp = generateOTP();
      await sendPhoneOtp(phone, otp);
      await newUser.updateOne({
        otp: otp,
        otpExpiry: new Date(Date.now() + 15 * 60 * 1000), // OTP valid for 15 minutes
      });
      res.status(201).json({
        success: true,
        message: "User created successfully",
        user: newUser,
      });
      return;
    } else {
      const otp = generateOTP();
      await sendPhoneOtp(phone, otp);
      const userId = user?._id.toString();
      if (!userId) {
        console.log("some problem with userId");
      }
      await user.updateOne({
        otp: otp,
        otpExpiry: new Date(Date.now() + 15 * 60 * 1000), // OTP valid for 15 minutes
      });
      res.status(200).json({
        success: true,
        message: "OTP sent successfully",
        user: user,
      });
      return;
    }
  } catch (error) {
    console.error("Error during onboarding:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: "Invalid input data",
      });
    }
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function verifyOtp(req: Request, res: Response) {
  try {
    const { phone, otp } = verifyOtpSchema.parse(req.body);

    const user = await User.findOne({ phone: phone.trim() });
    if (!user) {
      res.status(400).json({ success: false, message: "User not found" });
      return;
    }

    if (!user.otp) {
      res.status(400).json({ success: false, message: "Invalid OTP" });
      return;
    }

    if (user.otpExpiry && user.otpExpiry < new Date()) {
      res.status(400).json({ success: false, message: "OTP expired" });
      return;
    }

    // Verify submitted OTP matches stored OTP
    if (user.otp !== otp) {
      res.status(400).json({ success: false, message: "Incorrect OTP" });
      return;
    }

    user.otp = null;
    user.otpExpiry = null;
    user.isPhoneVerified = true;
    await user.save();

    const token = await generateToken(user._id.toString());

    if (!user.email || !user.name) {
      res.status(200).json({
        success: true,
        message: "OTP verified. Please complete your profile.",
        user: { _id: user._id, phone: user.phone },
        token,
        role: user.role,
        isProfileComplete: false,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "OTP verified. Logged in successfully.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      token,
      role: user.role,
      isProfileComplete: true,
    });
    return;
  } catch (error) {
    console.error("Error during OTP verification:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function completeProfile(req: CustomRequest, res: Response) {
  try {
    const { name, email, age, gender } = completeProfileSchema.parse(req.body);
    const user = req.user;
    if (!user) {
      res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
      return;
    }
    await User.findByIdAndUpdate(
      user._id,
      {
        name: name,
        email: email,
        age: age,
        gender: gender,
      },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: name,
        email: email,
        age: age,
        gender: gender,
      },
    });
    return;
  } catch (error) {
    console.error("Error during profile completion:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: "Invalid input data",
      });
      return;
    }
    res.status(500).json({ success: false, message: "Internal server error" });
    return;
  }
}

export const getUserProfile = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "User not authenticated" });
      return;
    }

    const user = await User.findById(req.user._id).populate('club');
    
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    // Check if user has an associated club
    let clubData = null;
    let clubStatus = null;

    if (user.club) {
      const club = await Club.findById(user.club);
      if (club) {
        const status = club.isApproved ? 'approved' : 'pending';
        clubData = {
          id: club._id,
          name: club.name,
          status: status
        };
        clubStatus = status;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isPhoneVerified: user.isPhoneVerified,
        },
        club: clubData,
        clubStatus: clubStatus
      }
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
const switchToClub = async (req: CustomRequest, res: Response): Promise<void> => {
  console.log("switch to club");

  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "User not authenticated" });
      return;
    }

    const user = await User.findById(req.user._id).populate("club");

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    if (user.role === "club") {
      res.status(400).json({ success: false, message: "User is already using club role" });
      return;
    }

    if (!user.club) {
      res.status(400).json({ success: false, message: "No club associated with user" });
      return;
    }

    const clubDoc = user.club as any; // populated club

    if (!clubDoc.isApproved) {
      res.status(403).json({
        success: false,
        message: "Club is not yet approved by admin",
        clubStatus: "pending",
      });
      return;
    }

    // ✅ Switch role
    user.role = "club";
    user.updatedAt = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Successfully switched to club role",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        club: {
          id: clubDoc._id,
          name: clubDoc.name,
          status: "approved",
        },
      },
    });
  } catch (error) {
    console.error("Error switching to club role:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};



const getNearbyEvents = async (req: CustomRequest, res: Response) => {

  try {
    // await updateExpiredEvents();
    const { latitude, longitude,city } = req.query;
    if (!latitude || !longitude) {
      res.status(400).json({ message: "Latitude and longitude required as query parameters" });
      return;
    }
    console.log("latitude", latitude);
    const userLat = parseFloat(latitude as string);
    const userLng = parseFloat(longitude as string);

    if (isNaN(userLat) || isNaN(userLng)) {
      res.status(400).json({ message: "Invalid latitude or longitude values" });
      return;
    }

    const query: any = { events: { $exists: true, $not: { $size: 0 } } };
    if (city) {
      query.city = { $regex: new RegExp(`^${city}$`, "i") };
    }
    const clubs = await clubModel.find(query).populate({
      path: "events",
      match: { status: "active" },
      populate: [
        { path: "tickets" },
        { path: "menuItems" }
      ]
    });

    // Calculate distances for all clubs in parallel using Promise.all
    const distancePromises = clubs
      .filter(club => club.mapLink) // Only process clubs with map links
      .map(async (club) => {
        try {
          const distanceResult = await calculateDistanceFromMapsLink(
            userLat,
            userLng,
            club.mapLink,
            process.env.GOOGLE_MAPS_API_KEY || "",
            "driving",
            true // use fallback
          );

          // Check if it's a Google Maps result or Haversine fallback
          if ('duration' in distanceResult.distance) {
            // Google Maps API result
            return {
              club,
              distanceInMeters: distanceResult.distance.distance.value,
              distanceText: distanceResult.distance.distance.text,
              durationText: distanceResult.distance.duration.text,
              durationInSeconds: distanceResult.distance.duration.value,
              method: "Google Maps API"
            };
          } else {
            // Haversine fallback result
            return {
              club,
              distanceInMeters: distanceResult.distance.distance.value,
              distanceText: distanceResult.distance.distance.text,
              durationText: "N/A",
              durationInSeconds: 0,
              method: distanceResult.distance.method
            };
          }
        } catch (error) {
          console.warn(`Failed to calculate distance for club ${club.name}:`, error);
          return null; // Return null for failed calculations
        }
      });

    // Wait for all distance calculations to complete
    const distanceResults = await Promise.all(distancePromises);
    
    // Filter out failed calculations and create final results
    const results = distanceResults.filter(result => result !== null);

    
    results.sort((a, b) => a.distanceInMeters - b.distanceInMeters);

    res.json({
      userLocation: { latitude: userLat, longitude: userLng },
      clubs: results,
    });
    return;

  } catch (err) {
    console.error('Error in getNearbyEvents:', err);
    res.status(500).json({ success: false, message: "Server error" });
    return;
  }
};

// Get public event details - for users to view any event details
const getPublicEventDetails = async (req: CustomRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "User not authenticated" });
      return;
    }

    const eventId = req.params.eventId;
    console.log("Fetching public event details for ID:", eventId);
    
    if (!eventId) {
      res.status(400).json({ success: false, message: "Event ID is required" });
      return;
    }

    // Fetch event details directly without club ownership check
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
    console.error("Error fetching public event details:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
    return;
  }
};

// Purchase tickets for an event
const purchaseTicket = async (req: CustomRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "User not authenticated" });
      return;
    }

    const { eventId, ticketType, quantity } = req.body;
    console.log("Purchase request:", { eventId, ticketType, quantity, userId: req.user._id });

    // Validate input
    if (!eventId || !ticketType || !quantity) {
      res.status(400).json({ 
        success: false, 
        message: "eventId, ticketType, and quantity are required" 
      });
      return;
    }

    if (quantity < 1 || quantity > 10) {
      res.status(400).json({ 
        success: false, 
        message: "Quantity must be between 1 and 10" 
      });
      return;
    }

    // Find the event and validate it exists
    const event = await eventModel.findOne({ _id: eventId, status: "active" }).populate("tickets");
    if (!event) {
      res.status(404).json({ success: false, message: "Event not found or not active" });
      return;
    }

    // Find the club hosting the event
    const club = await Club.findOne({ events: eventId });
    if (!club) {
      res.status(404).json({ success: false, message: "Club not found for this event" });
      return;
    }

    // Validate that the ticket type exists in the event
    const validTicket: any = (event.tickets as any[]).find((ticket: any) => ticket.name === ticketType);
    if (!validTicket) {
      res.status(400).json({ 
        success: false, 
        message: `Ticket type "${ticketType}" not found for this event`,
        availableTickets: (event.tickets as any[]).map((t: any) => ({ name: t.name, price: t.price }))
      });
      return;
    }

    // Check if enough tickets are available for the order
    const availableTickets = validTicket.quantityAvailable - validTicket.quantitySold;
    if (availableTickets < quantity) {
      res.status(400).json({ 
        success: false, 
        message: `Only ${availableTickets} tickets available for ${ticketType}`,
        available: availableTickets
      });
      return;
    }

    // Generate dummy transaction ID
    const generateTransactionId = () => {
      return `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    };

    // Always create a new order
    const transactionId = generateTransactionId();
    const order = await new orderModel({
      event: eventId,
      club: club._id,
      ticket: validTicket._id,
      quantity: quantity,
      isPaid: true,
      transactionId: transactionId
    }).save();

    // Add new order to user's orders array
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { orders: order._id } }
    );

    console.log(`Created new order ${order._id} with ${quantity} tickets`);

    // Update ticket sold quantity
    await ticketModel.findByIdAndUpdate(validTicket._id, { $inc: { quantitySold: quantity } });

    // Calculate totals
    const totalAmount = validTicket.price * quantity;

    const message = `Successfully purchased ${quantity} ticket(s)`;

    console.log(`Successfully created new order for user ${req.user._id}`);

    res.json({
      success: true,
      message: message,
      data: {
        ordersCreated: 1,
        ordersUpdated: 0,
        ticketType: ticketType,
        pricePerTicket: validTicket.price,
        totalAmount: totalAmount,
        finalQuantity: quantity,
        event: {
          id: event._id,
          name: event.name,
          date: event.date,
          time: event.time
        },
        club: {
          id: club._id,
          name: club.name,
          city: club.city
        },
        order: {
          id: order._id,
          transactionId: order.transactionId,
          isPaid: order.isPaid,
          quantity: order.quantity,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt
        }
      }
    });
    return;

  } catch (error) {
    console.error("Error purchasing tickets:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
    return;
  }
};

const getBookings = async (req: CustomRequest, res: Response) => {
  try{
    if(!req.user){
      res.status(401).json({ success: false, message: "User not authenticated" });
      return;
    }
    
    const status = req.params.status; // Get status from URL parameter
    console.log("status", status);
    
    // Build the query to filter orders by status if provided
    let userQuery = User.findById(req.user._id);
    
    if (status) {
      // If status is provided, populate orders and filter by status
      userQuery = userQuery.populate({
        path: "orders",
        match: { status: status }, // Filter orders by status
        populate: [
          { path: "event", model: "Event" },
          { path: "ticket", model: "Ticket" },
          { path: "club", model: "Club" },
        ],
      });
    } else {
      // If no status provided, get all orders
      userQuery = userQuery.populate({
        path: "orders",
        populate: [
          { path: "event", model: "Event" },
          { path: "ticket", model: "Ticket" },
          { path: "club", model: "Club" },
        ],
      });
    }

    const bookings = await userQuery;
    console.log("bookings", bookings);
    res.status(200).json({ success: true, data: bookings });
    return;
  }catch(err){
    console.error("Error fetching bookings:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
    return;
  }
}

export { onboarding, verifyOtp, completeProfile, switchToClub, getNearbyEvents, getPublicEventDetails, purchaseTicket, getBookings };
