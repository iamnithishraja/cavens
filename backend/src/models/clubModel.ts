import mongoose from "mongoose";

const clubSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  logoUrl: {
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
  clubDescription: {
    type: String,
    required: true,
  },
  typeOfVenue: {
    type: String,
    required: true,
  },
  coverBannerUrl: {
    type: String,
  },
  photos: {
    type: [String],
  },
  clubImages: {
    type: [String],
  },
  city: {
    type: String,
    required: true,
  },
  operatingDays: {
    type: [String],
    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    required: true,
  },
  events: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    },
  ],
  phone: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    default: 0,
  },
  address: {
    type: String,
    required: true,
  },
  mapLink: {
    type: String,
    required: true,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const clubModel = mongoose.model("Club", clubSchema);

export default clubModel;