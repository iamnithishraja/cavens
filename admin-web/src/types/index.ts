export type { User } from "./userTypes";

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  token: string;
  role: 'admin' | 'user' | 'club';
  isProfileComplete: boolean;
  user: { _id: string; name?: string; email?: string; phone?: string };
}

export interface ClubItem {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt?: string;
  logoUrl?: string;
  clubDescription?: string;
  typeOfVenue?: string;
  coverBannerUrl?: string;
  photos?: string[];
  clubImages?: string[];
  operatingDays?: string[];
  events?: string[];
  mapLink?: string;
}


