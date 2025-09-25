import eventModel from '../models/eventModel';
import clubModel from '../models/clubModel';
import { calculateDistanceFromMapsLink } from './mapsDistanceCalculator';

// Search events for chatbot
export async function searchEventsForChatbot(query: string, city: string): Promise<any[]> {
  try {
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Search in events directly
    const events = await eventModel.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { djArtists: { $regex: query, $options: 'i' } }
      ],
      status: 'active',
      date: { $gte: currentDate }
    })
    .select('name description date time djArtists tickets guestExperience coverImage status')
    .populate({
      path: 'club',
      select: 'name city address phone rating photos typeOfVenue clubDescription operatingDays'
    })
    .sort({ isFeatured: -1, date: 1 })
    .limit(10)
    .lean();

    return events.map(event => ({
      id: event._id,
      name: event.name,
      description: event.description,
      date: event.date,
      time: event.time,
      venue: (event as any).club?.name || 'Unknown Venue',
      city: (event as any).club?.city || city,
      djArtists: event.djArtists,
      tickets: event.tickets,
      guestExperience: event.guestExperience,
      coverImage: event.coverImage
    }));
    
  } catch (error) {
    console.error('Error searching events:', error);
    return [];
  }
}

// Search clubs for chatbot
export async function searchClubsForChatbot(query: string, city: string): Promise<any[]> {
  try {
    const clubs = await clubModel.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { clubDescription: { $regex: query, $options: 'i' } },
        { typeOfVenue: { $regex: query, $options: 'i' } }
      ],
      city: { $regex: new RegExp(`^${city}$`, 'i') },
      isApproved: true
    })
    .select('name city address phone rating photos typeOfVenue clubDescription operatingDays')
    .limit(10)
    .lean();

    return clubs.map(club => ({
      id: club._id,
      name: club.name,
      description: club.clubDescription,
      type: club.typeOfVenue,
      city: club.city,
      address: club.address,
      phone: club.phone,
      rating: club.rating,
      photos: club.photos,
      operatingDays: club.operatingDays
    }));
    
  } catch (error) {
    console.error('Error searching clubs:', error);
    return [];
  }
}

// Find event from query
export async function findEventFromQuery(intent: any, city: string): Promise<any> {
  try {
    if (intent.eventId) {
      return await getEventDetails(intent.eventId);
    }

    if (intent.extractedInfo?.eventName) {
      const event = await eventModel.findOne({
        name: { $regex: new RegExp(intent.extractedInfo.eventName, 'i') },
        status: 'active'
      })
      .populate({
        path: 'club',
        select: 'name city address phone rating photos typeOfVenue clubDescription operatingDays'
      })
      .lean();

      if (event) {
        return {
          id: event._id,
          name: event.name,
          description: event.description,
          date: event.date,
          time: event.time,
          venue: (event as any).club?.name || 'Unknown Venue',
          city: (event as any).club?.city || city,
          djArtists: event.djArtists,
          tickets: event.tickets,
          guestExperience: event.guestExperience,
          coverImage: event.coverImage
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Error finding event from query:', error);
    return null;
  }
}

// Find club from query
export async function findClubFromQuery(intent: any, city: string): Promise<any> {
  try {
    if (intent.extractedInfo?.clubName) {
      const club = await clubModel.findOne({
        name: { $regex: new RegExp(intent.extractedInfo.clubName, 'i') },
        city: { $regex: new RegExp(`^${city}$`, 'i') },
        isApproved: true
      })
      .select('name city address phone rating photos typeOfVenue clubDescription operatingDays')
      .lean();

      if (club) {
        return {
          id: club._id,
          name: club.name,
          description: club.clubDescription,
          type: club.typeOfVenue,
          city: club.city,
          address: club.address,
          phone: club.phone,
          rating: club.rating,
          photos: club.photos,
          operatingDays: club.operatingDays
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Error finding club from query:', error);
    return null;
  }
}

// Get event details
export async function getEventDetails(eventId: string): Promise<any> {
  try {
    const event = await eventModel.findById(eventId)
      .populate({
        path: 'club',
        select: 'name city address phone rating photos typeOfVenue clubDescription operatingDays'
      })
      .lean();

    if (!event) return null;

    return {
      id: event._id,
      name: event.name,
      description: event.description,
      date: event.date,
      time: event.time,
      venue: (event as any).club?.name || 'Unknown Venue',
      city: (event as any).club?.city || 'Unknown City',
      djArtists: event.djArtists,
      tickets: event.tickets,
      guestExperience: event.guestExperience,
      coverImage: event.coverImage
    };
  } catch (error) {
    console.error('Error getting event details:', error);
    return null;
  }
}

// Get clubs with distance calculation
export async function getClubsWithDistance(userLocation: { latitude: number; longitude: number }, city: string): Promise<any[]> {
  try {
    const clubs = await clubModel.find({
      city: { $regex: new RegExp(`^${city}$`, 'i') },
      isApproved: true,
      events: { $exists: true, $not: { $size: 0 } }
    })
    .select('name city address phone rating photos typeOfVenue clubDescription operatingDays')
    .populate({
      path: 'events',
      select: 'name description date time djArtists tickets guestExperience coverImage status',
      match: { 
        status: 'active',
        date: { $gte: new Date().toISOString().split('T')[0] }
      },
      options: { 
        sort: { isFeatured: -1, date: 1 }, 
        limit: 10 
      }
    })
    .limit(10)
    .lean();

    // Calculate distances
    const clubsWithDistance = await Promise.all(
      clubs.map(async (club) => {
        let distanceFromUser = null;
        if (club.address) {
          try {
            distanceFromUser = await calculateDistanceFromMapsLink(
              userLocation.latitude,
              userLocation.longitude,
              club.address,
              process.env.GOOGLE_MAPS_API_KEY || "",
              process.env.GOOGLE_MAPS_API_KEY || ""
            );
          } catch (error) {
            console.error('Error calculating distance for club:', club.name, error);
          }
        }
        
        return {
          ...club,
          distanceFromUser
        };
      })
    );

    return clubsWithDistance;
  } catch (error) {
    console.error('Error getting clubs with distance:', error);
    return [];
  }
}
