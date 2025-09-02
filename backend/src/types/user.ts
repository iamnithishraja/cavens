import mongoose from "mongoose";

export type UserRole = "admin" | "user" | "club";
export interface IUser {
    _id: mongoose.Types.ObjectId;
    email?: string| null;
    name?: string | null;
    phone?: string | null;
    isPhoneVerified: boolean;
    role: UserRole;
    otp?: string;
    otpExpiry?: Date;
    club?: mongoose.Schema.Types.ObjectId;
    orders?: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
  }