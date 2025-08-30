import eventModel from "../models/eventModel";

const updateExpiredEvents = async () => {
    const events = await eventModel.find({ status: "active" });
    const now = new Date();
  
    for (const event of events) {
      // assuming event.date = "2025-08-30" and event.time = "22:00"
      const eventStart = new Date(`${event.date}T${event.time}:00`);
  
      // add 10 minutes
      const eventEnd = new Date(eventStart.getTime() + 10 * 60 * 1000);
  
      if (now >= eventEnd) {
        event.status = "done";
        await event.save();
      }
    }
  };

export default updateExpiredEvents;
  