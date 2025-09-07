import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    sparse: true, // Allows for unique email or phone, but not both
    default: undefined,
  },
  name:{
    type: String,
  },
  phone: {
    type: String,
    unique: true,
  },
  isPhoneVerified: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ["admin", "user", "club"],
    default: "user",
  },
  otp: {
    type: String,
  },
  otpExpiry: {
    type: Date,
  },
  age:{
    type: String,
    enum: ["18-30", "30-50", "50+"],
  },
  gender:{
    type: String,
    enum: ["male", "female", "other"],
  },
  club: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Club",
  },
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", userSchema);

export default User;