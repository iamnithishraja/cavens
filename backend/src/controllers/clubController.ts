import type { Request, Response } from "express";
import Club from "../models/clubModel";
import eventModel from "../models/eventModel";

export const createClub = async (req: Request, res: Response): Promise<void> => {
  try {
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

    res.status(201).json({ success: true, club });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const saveEventData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clubId, events } = req.body;

    // Enforce at most one event
    const normalizedEvents = Array.isArray(events) ? events.slice(0, 1) : [];

    const payload = {
      clubId: clubId || undefined,
      events: normalizedEvents,
      updatedAt: new Date(),
    };

    if (clubId) {
      const doc = await eventModel.findOneAndUpdate({ clubId }, payload, { upsert: true, new: true });
      res.status(200).json({ success: true, data: doc });
      return;
    }

    const doc = await eventModel.create(payload);
    res.status(201).json({ success: true, data: doc });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


