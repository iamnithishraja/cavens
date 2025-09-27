import eventModel from '../models/eventModel';
import clubModel from '../models/clubModel';
import openRouterService from './openRouterService';
import { getSchemaForAI } from './databaseSchema';

// Fast rule-based query generation (no AI call)
function generateFastQuery(userMessage: string, intent: any, city: string): { model: string; query: any; populate?: any } {
  const lowerMessage = userMessage.toLowerCase();
  const currentDate = new Date().toISOString().split('T')[0];
  
  // Event-related queries
  if (intent.type === 'find_events' || intent.type === 'filter_events') {
    if (intent.extractedInfo?.nearMe) {
      // For "near me" queries, return clubs with events
      return {
        model: 'Club',
        query: { 
          city: { $regex: new RegExp(`^${city}$`, 'i') }, 
          isApproved: true,
          events: { $exists: true, $ne: [] }
        },
        populate: {
          path: 'events',
          match: { 
            status: 'active',
            date: { $gte: currentDate }
          }
        }
      };
    } else {
      // For specific event searches
      return {
        model: 'Club',
        query: { 
          city: { $regex: new RegExp(`^${city}$`, 'i') }, 
          isApproved: true,
          events: { $exists: true, $ne: [] }
        },
        populate: {
          path: 'events',
          match: { 
            status: 'active',
            date: { $gte: currentDate }
          }
        }
      };
    }
  }
  
  // Club-related queries
  if (intent.type === 'find_clubs' || intent.type === 'filter_clubs') {
    if (intent.extractedInfo?.nearMe) {
      return {
        model: 'Club',
        query: { 
          city: { $regex: new RegExp(`^${city}$`, 'i') }, 
          isApproved: true 
        }
      };
    } else {
      return {
        model: 'Club',
        query: { 
          city: { $regex: new RegExp(`^${city}$`, 'i') }, 
          isApproved: true 
        }
      };
    }
  }
  
  // Booking queries
  if (intent.type === 'my_bookings') {
    return {
      model: 'User',
      query: { _id: intent.userId || null },
      populate: {
        path: 'orders',
        match: { status: 'paid' },
        populate: [
          { path: 'event' },
          { path: 'club' },
          { path: 'ticket' }
        ]
      }
    };
  }
  
  // Default to clubs with events
  return {
    model: 'Club',
    query: { 
      city: { $regex: new RegExp(`^${city}$`, 'i') }, 
      isApproved: true,
      events: { $exists: true, $ne: [] }
    },
    populate: {
      path: 'events',
      match: { 
        status: 'active',
        date: { $gte: currentDate }
      }
    }
  };
}

// Fast rule-based query generation (no AI call)
export async function executeAIGeneratedQuery(
  userMessage: string,
  intent: any,
  city: string
): Promise<{ data: any[]; type: string }> {
  try {
    const schema = getSchemaForAI();
    const queryConfig = await openRouterService.generateDatabaseQuery(userMessage, intent, schema);
    
    let results = [];
    
    // Execute the query based on model
    switch (queryConfig.model) {
      case 'Club':
        if (queryConfig.populate) {
          // Optimize populate with selective fields for chat responses
          const optimizedPopulate = {
            ...queryConfig.populate,
            select: 'name description date time djArtists tickets guestExperience coverImage status'
          };
          results = await clubModel.find(queryConfig.query)
            .select('name city address phone rating photos typeOfVenue clubDescription operatingDays')
            .populate(optimizedPopulate)
            .limit(10);
        } else {
          results = await clubModel.find(queryConfig.query)
            .select('name city address phone rating photos typeOfVenue clubDescription operatingDays')
            .limit(10);
        }
        break;
        
      case 'Event':
        if (queryConfig.populate) {
          results = await eventModel.find(queryConfig.query)
            .select('name description date time djArtists tickets guestExperience coverImage status')
            .populate(queryConfig.populate)
            .limit(10);
        } else {
          results = await eventModel.find(queryConfig.query)
            .select('name description date time djArtists tickets guestExperience coverImage status')
            .limit(10);
        }
        break;
        
      default:
        // Fallback to club search with optimized fields
        results = await clubModel.find({ 
          city: { $regex: new RegExp(`^${city}$`, 'i') }, 
          isApproved: true 
        })
        .select('name city address phone rating photos typeOfVenue clubDescription operatingDays')
        .limit(10);
        break;
    }
    
    
    return {
      data: results,
      type: queryConfig.model
    };
    
  } catch (error) {
    console.error('Error executing AI generated query:', error);
    const fallbackResults = await clubModel.find({ 
      city: { $regex: new RegExp(`^${city}$`, 'i') }, 
      isApproved: true 
    })
    .select('name city address phone rating photos typeOfVenue clubDescription operatingDays')
    .limit(10);
    return {
      data: fallbackResults,
      type: 'Club'
    };
  }
}

// Helper function to extract events from clubs (avoids code duplication)
export function extractEventsFromClubs(clubs: any[]): any[] {
  const events: any[] = [];
  clubs.forEach(club => {
    if (club.events && Array.isArray(club.events)) {
      club.events.forEach((event: any) => {
        if (event && event._id) {
          events.push({
            id: event._id,
            name: event.name,
            description: event.description,
            date: event.date,
            time: event.time,
            venue: club.name,
            city: club.city,
            djArtists: event.djArtists,
            tickets: event.tickets,
            guestExperience: event.guestExperience,
            distanceFromUser: club.distanceFromUser
          });
        }
      });
    }
  });
  return events;
}
