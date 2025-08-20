import type { Request, Response } from "express";
import Club from "../models/clubModel";

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


