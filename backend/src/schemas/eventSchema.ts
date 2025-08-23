import { z } from "zod";

const ticketSchema = z.object({
  name: z.string().min(1, "Ticket name is required"),
  price: z.string().min(1, "Price is required"),
  description: z.string().optional(),
  quantity: z.string().min(1, "Quantity is required"),
});

const menuItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  price: z.string().min(1, "Price is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  itemImage: z.string().optional(),
});

const guestExperienceSchema = z.object({
  dressCode: z.string().optional(),
  entryRules: z.string().optional(),
  tableLayoutMap: z.string().optional(),
  parkingInfo: z.string().optional(),
  accessibilityInfo: z.string().optional(),
});

const eventSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  date: z.string().min(1, "Event date is required"),
  time: z.string().min(1, "Event time is required"),
  djArtists: z.string().optional(),
  description: z.string().min(1, "Event description is required"),
  coverImage: z.string().optional(),
  tickets: z.array(ticketSchema).optional(),
  menuItems: z.array(menuItemSchema).optional(),
  guestExperience: guestExperienceSchema.optional(),
  galleryPhotos: z.array(z.string()).optional(),
  promoVideos: z.array(z.string()).optional(),
  happyHourTimings: z.string().optional(),
});

export const createEventSchema = z.object({
  events: z.array(eventSchema).length(1, "Exactly one event is required"),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
