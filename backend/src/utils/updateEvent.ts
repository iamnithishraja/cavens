import eventModel from "../models/eventModel";

const updateExpiredEvents = async () => {
    const events = await eventModel.find({ status: "active" });
    const now = new Date();
  
    for (const event of events) {
      try {
        if (!event.date || !event.time) {
          console.log(`Event ${event._id} missing date or time, skipping...`);
          continue;
        }

        // Convert 12-hour format (e.g., "8:05 PM") to 24-hour format
        let timeForParsing = event.time;
        if (event.time.includes('AM') || event.time.includes('PM')) {
          const timeParts = event.time.split(' ');
          if (timeParts.length >= 2) {
            const timePart = timeParts[0];
            const period = timeParts[1];
            const timeComponents = (timePart || '').split(':');
            
            if (timeComponents.length >= 2) {
              const hours = timeComponents[0];
              const minutes = timeComponents[1];
              let hour24 = parseInt(hours || '0');
              
              if (period === 'PM' && hour24 !== 12) {
                hour24 += 12;
              } else if (period === 'AM' && hour24 === 12) {
                hour24 = 0;
              }
              
              timeForParsing = `${hour24.toString().padStart(2, '0')}:${minutes}`;
            }
          }
        }

        const eventStart = new Date(`${event.date}T${timeForParsing}:00`);
        
        // Check if the date is valid
        if (isNaN(eventStart.getTime())) {
          console.log(`Invalid date/time for event ${event._id}: ${event.date} ${event.time}`);
          continue;
        }

        // add 10 minutes
        const eventEnd = new Date(eventStart.getTime() + 10 * 60 * 1000);
  
        if (now >= eventEnd) {
          console.log(`Marking event ${event._id} as done (event ended at ${eventEnd})`);
          event.status = "done";
          await event.save();
        }
      } catch (error) {
        console.error(`Error processing event ${event._id}:`, error);
        continue;
      }
    }
  };

export default updateExpiredEvents;
  