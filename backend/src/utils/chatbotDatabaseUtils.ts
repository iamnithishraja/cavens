import eventModel from '../models/eventModel';
import clubModel from '../models/clubModel';
import openRouterService from './openRouterService';
import { getSchemaForAI } from './databaseSchema';

// AI generates query and executes it
export async function executeAIGeneratedQuery(
  userMessage: string,
  intent: any,
  city: string
): Promise<{ data: any[]; type: string }> {
  try {
    const schema = getSchemaForAI();
    const queryConfig = await openRouterService.generateDatabaseQuery(userMessage, intent, schema);
    
    console.log('🔍 [QUERY DEBUG] Generated query config:', queryConfig);
    
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
