import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
  {
    name: String,
    price: String,
    description: String,
    category: String,
    customCategory: String,
  },
  { _id: false }
);

const eventTicketSchema = new mongoose.Schema(
  {
    name: String,
    price: String,
    description: String,
    quantity: String,
  },
  { _id: false }
);

const eventDraftSchema = new mongoose.Schema(
  {
    name: String,
    date: String,
    time: String,
    djArtists: String,
    description: String,
    coverImage: String,
    ticketTypes: [eventTicketSchema],
    // Event-specific data:
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
  },
  { _id: false }
);

const clubManagerSchema = new mongoose.Schema({
  clubId: { type: mongoose.Schema.Types.ObjectId, ref: "Club" },
  events: [eventDraftSchema],
  updatedAt: { type: Date, default: Date.now },
});

const ClubManager = mongoose.model("ClubManager", clubManagerSchema);
export default ClubManager;


