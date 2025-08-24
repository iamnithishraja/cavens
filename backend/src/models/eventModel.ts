import mongoose from "mongoose";
import { menuItemSchema } from "./menuItemSchema";
import { ticketSchema } from "./ticketModel";

const eventSchema = new mongoose.Schema({
    name: String,
    date: String,
    time: String,
    djArtists: String,
    description: String,
    coverImage: String,
    tickets: [ticketSchema],
    menuItems: [menuItemSchema],
    
    guestExperience: {
      dressCode: String,
      entryRules: String,
      tableLayoutMap: String,
      parkingInfo: String,
      accessibilityInfo: String,
    },
    galleryPhotos: [String],
    promoVideos: [String],
    happyHourTimings: String,
  });

const eventModel = mongoose.model("Event", eventSchema);

export default eventModel;