import mongoose from "mongoose";
import { stat } from "node:fs";

// Simplified Order Schema
const orderSchema = new mongoose.Schema({
  // Event for which tickets are being purchased
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  
  // Club hosting the event
  club: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Club",
    required: true,
  },

  // Selected ticket
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ticket",
    required: true,
  },
  
  quantity: {
    type: Number,
    required: true,
  },
  
  status: {
    type: String,
    enum: ["paid", "scanned"],
    default: "paid",
  },
  // Payment status
  isPaid: {
    type: Boolean,
    default: false,
  },
  transactionId:{
    type: String,
    required: true,
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});



const orderModel = mongoose.model("Order", orderSchema);

export default orderModel;