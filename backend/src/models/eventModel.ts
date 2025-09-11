import mongoose from "mongoose";
import { menuItemSchema } from "./menuItemSchema";
import { ticketSchema } from "./ticketModel";
import { start } from "repl";

const eventSchema = new mongoose.Schema({
    name: String,
    date: String,
    time: String,
    djArtists: String,
    description: String,
    coverImage: String,
    eventMap: String,
    tickets: [{
      ref: "Ticket",
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    }],
    menuItems: [{
      ref: "MenuItem",
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    }],
    
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
    isFeatured: {
      type: Boolean,
      default: false,
    },
    featuredNumber:{
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "done"],
      default: "active",
    },
  });

const eventModel = mongoose.model("Event", eventSchema);

export default eventModel;