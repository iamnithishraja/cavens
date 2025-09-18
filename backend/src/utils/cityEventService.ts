import Club from '../models/clubModel.js';
import eventModel from '../models/eventModel.js';
import orderModel from '../models/orderModel.js';
import ticketModel from '../models/ticketModel.js';

export interface TopEventData {
  event: any;
  club: any;
  totalBookings: number;
  popularityScore: number;
}

export class CityEventService {
  private static instance: CityEventService;

  static getInstance(): CityEventService {
    if (!CityEventService.instance) {
      CityEventService.instance = new CityEventService();
    }
    return CityEventService.instance;
  }

  /**
   * Get the top event in a city based on booking popularity
   */
  async getTopEventByCity(city: string): Promise<TopEventData | null> {
    try {
      console.log(`🔍 Finding top event in city: ${city}`);

      // Normalize city name for better matching
      const normalizedCity = city.toLowerCase().trim();
      console.log(`🔍 Searching for clubs in normalized city: "${normalizedCity}"`);

      // Find clubs in the specified city with active events
      const clubs = await Club.find({ 
        city: { $regex: new RegExp(`^${normalizedCity}$`, "i") },
        isApproved: true,
        events: { $exists: true, $not: { $size: 0 } }
      }).populate({
        path: "events",
        match: { status: "active" },
        populate: [
          { path: "tickets" },
          { path: "menuItems" }
        ]
      });

      if (!clubs || clubs.length === 0) {
        console.log(`❌ No clubs found in city: ${city}`);
        return null;
      }

      // Get all active events from clubs in this city
      const allEvents = [];
      for (const club of clubs) {
        if (club.events && club.events.length > 0) {
          for (const event of club.events) {
            allEvents.push({
              event,
              club,
              eventId: event._id,
              clubId: club._id
            });
          }
        }
      }

      if (allEvents.length === 0) {
        console.log(`❌ No active events found in city: ${city}`);
        console.log(`🔍 Debug: Found ${clubs.length} clubs, but none have active events`);
        return null;
      }

      console.log(` Found ${allEvents.length} active events in ${city} across ${clubs.length} clubs`);

      // Calculate popularity score for each event
      const eventScores = await Promise.all(
        allEvents.map(async ({ event, club, eventId, clubId }) => {
          try {
            // Get total bookings for this event
            const totalBookings = await orderModel.countDocuments({
              event: eventId,
              isPaid: true
            });

            // Get total tickets sold for this event
            const ticketsSold = await orderModel.aggregate([
              { $match: { event: eventId, isPaid: true } },
              { $group: { _id: null, totalTickets: { $sum: "$quantity" } } }
            ]);

            const totalTicketsSold = ticketsSold.length > 0 ? ticketsSold[0].totalTickets : 0;

            // Calculate popularity score based on:
            // 1. Total bookings (40% weight)
            // 2. Total tickets sold (40% weight) 
            // 3. Event featured status (20% weight)
            const eventData = event as any; // Type assertion for populated event
            const popularityScore = 
              (totalBookings * 0.4) + 
              (totalTicketsSold * 0.4) + 
              (eventData.isFeatured ? 10 : 0) * 0.2;

            console.log(`📈 Event "${eventData.name}": ${totalBookings} bookings, ${totalTicketsSold} tickets, score: ${popularityScore.toFixed(2)}`);

            return {
              event,
              club,
              totalBookings,
              totalTicketsSold,
              popularityScore
            };
          } catch (error) {
            console.error(`❌ Error calculating score for event ${eventId}:`, error);
            return {
              event,
              club,
              totalBookings: 0,
              totalTicketsSold: 0,
              popularityScore: 0
            };
          }
        })
      );

      // Sort by popularity score (highest first)
      eventScores.sort((a, b) => b.popularityScore - a.popularityScore);

      const topEvent = eventScores[0];
      
      if (topEvent && topEvent.popularityScore > 0) {
        const topEventData = topEvent.event as any; // Type assertion for populated event
        console.log(`🏆 Top event in ${city}: "${topEventData.name}" with score ${topEvent.popularityScore.toFixed(2)}`);
        return {
          event: topEvent.event,
          club: topEvent.club,
          totalBookings: topEvent.totalBookings,
          popularityScore: topEvent.popularityScore
        };
      } else {
        console.log(`❌ No popular events found in ${city}`);
        return null;
      }

    } catch (error) {
      console.error('❌ Error getting top event by city:', error);
      return null;
    }
  }

  /**
   * Get event details formatted for notifications
   */
  formatEventForNotification(eventData: TopEventData): {
    title: string;
    body: string;
    imageUrl?: string;
    data: any;
  } {
    const { event, club, totalBookings } = eventData;
    
    // Create modern, professional notification content
    // const cityEmoji = club.city.toLowerCase() === 'dubai' ? '🏙️' : '🌆';
    const title = `Trending Event in ${club.city}!`;
    
    // Single, professional notification body that works for all scenarios
    const body = `🔥 Event "${event.name}" at ${club.name}  • Don't miss out - reserve your spot now!`;
    
    return {
      title,  
      body,
      imageUrl: event.coverImage,
      data: {
        type: 'city_event_recommendation',
        eventId: event._id.toString(),
        eventName: event.name,
        clubName: club.name,
        clubId: club._id.toString(),
        city: club.city,
        date: event.date,
        time: event.time,
        totalBookings,
        deepLink: `cavens://event/${event._id}`,
        timestamp: new Date().toISOString()
      }
    };
  }
}

// Export singleton instance
export const cityEventService = CityEventService.getInstance();
