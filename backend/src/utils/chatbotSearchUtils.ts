import eventModel from '../models/eventModel';
import clubModel from '../models/clubModel';
import { calculateDistanceFromMapsLink } from './mapsDistanceCalculator';

// Search events for chatbot
export async function searchEventsForChatbot(query: string, city: string): Promise<any[]> {
  try {
    const currentDate = new Date().toISOString().split('T')[0];
    
    console.log('🔍 [SEARCH EVENTS] Searching for query:', query, 'in city:', city);
    
    // Search in clubs with events (events are embedded in clubs)
    const clubs = await clubModel.find({
      city: { $regex: new RegExp(`^${city}$`, 'i') },
      isApproved: true,
      events: { $exists: true, $ne: [] }
    })
    .select('name city address phone rating photos typeOfVenue clubDescription operatingDays events')
    .sort({ rating: -1 })
    .limit(10)
    .lean();

    console.log('🔍 [SEARCH EVENTS] Found clubs:', clubs.length);

    // Extract events from clubs and filter by query
    const events: any[] = [];
    clubs.forEach(club => {
      if (club.events && Array.isArray(club.events)) {
        club.events.forEach((event: any) => {
          if (event.status === 'active' && event.date && currentDate && event.date >= currentDate) {
            // Check if event name matches the query (case insensitive)
            const eventName = (event as any).name || '';
            const queryLower = query.toLowerCase();
            const eventNameLower = eventName.toLowerCase();
            
            console.log('🔍 [SEARCH EVENTS] Checking event:', eventName, 'against query:', query);
            
            if (eventNameLower.includes(queryLower) || queryLower.includes(eventNameLower)) {
              console.log('🔍 [SEARCH EVENTS] Match found:', eventName);
              events.push({
                id: event._id,
                name: (event as any).name,
                description: (event as any).description,
                date: (event as any).date,
                time: (event as any).time,
                venue: club.name,
                city: club.city,
                djArtists: (event as any).djArtists,
                tickets: (event as any).tickets,
                guestExperience: (event as any).guestExperience,
                coverImage: (event as any).coverImage,
                isFeatured: (event as any).isFeatured
              });
            }
          }
        });
      }
    });

    console.log('🔍 [SEARCH EVENTS] Found matching events:', events.length);

    return events.sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }).slice(0, 10);
    
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
      // Search in clubs with events
      const clubs = await clubModel.find({
        city: { $regex: new RegExp(`^${city}$`, 'i') },
        isApproved: true,
        events: { $exists: true, $ne: [] }
      })
      .select('name city address phone rating photos typeOfVenue clubDescription operatingDays events')
      .lean();

      // Find the event in clubs
      for (const club of clubs) {
        if (club.events && Array.isArray(club.events)) {
          const event = club.events.find((e: any) => {
            if (!e.name || !intent.extractedInfo.eventName) return false;
            
            const eventName = e.name.toLowerCase();
            const searchName = intent.extractedInfo.eventName.toLowerCase();
            
            // Try exact match first
            if (eventName === searchName) return true;
            
            // Try partial match
            if (eventName.includes(searchName) || searchName.includes(eventName)) return true;
            
            // Try word-by-word match
            const eventWords = eventName.split(/\s+/);
            const searchWords = searchName.split(/\s+/);
            
            // If any word matches, consider it a match
            return searchWords.some((word: string) => 
              word.length > 2 && eventWords.some((eventWord: string) => 
                eventWord.includes(word) || word.includes(eventWord)
              )
            );
          });
          
          if (event) {
            return {
              id: event._id,
              name: (event as any).name,
              description: (event as any).description,
              date: (event as any).date,
              time: (event as any).time,
              venue: club.name,
              city: club.city,
              djArtists: (event as any).djArtists,
              tickets: (event as any).tickets,
              guestExperience: (event as any).guestExperience,
              coverImage: (event as any).coverImage,
              isFeatured: (event as any).isFeatured
            };
          }
        }
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
    // Search in clubs for the event
    const clubs = await clubModel.find({
      events: { $exists: true, $ne: [] }
    })
    .select('name city address phone rating photos typeOfVenue clubDescription operatingDays events')
    .lean();

    // Find the event in clubs
    for (const club of clubs) {
      if (club.events && Array.isArray(club.events)) {
        const event = club.events.find((e: any) => e._id && e._id.toString() === eventId);
        
        if (event) {
          return {
            id: event._id,
            name: (event as any).name,
            description: (event as any).description,
            date: (event as any).date,
            time: (event as any).time,
            venue: club.name,
            city: club.city,
            djArtists: (event as any).djArtists,
            tickets: (event as any).tickets,
            guestExperience: (event as any).guestExperience,
            coverImage: (event as any).coverImage,
            isFeatured: (event as any).isFeatured
          };
        }
      }
    }

    return null;
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
