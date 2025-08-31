import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import eventModel from "../models/eventModel";
import ticketModel from "../models/ticketModel";
import MenuItem from "../models/menuItemSchema";

async function migrate() {
  const dbUrl = process.env.DB_URL || "";
  if (!dbUrl) {
    console.error("DB_URL is not set in environment.");
    process.exit(1);
  }

  console.log("Connecting to DB...", dbUrl.replace(/:\\w+@/, ":***@"));
  await mongoose.connect(dbUrl);
  console.log("Connected.");

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const events = await eventModel.find({}).session(session);
    console.log(`Found ${events.length} events`);

    for (const ev of events) {
      const needsTicketMigration = Array.isArray(ev.tickets) && ev.tickets.length > 0 && typeof ev.tickets[0] !== "string" && !(ev.tickets[0] instanceof mongoose.Types.ObjectId);
      const needsMenuMigration = Array.isArray(ev.menuItems) && ev.menuItems.length > 0 && typeof ev.menuItems[0] !== "string" && !(ev.menuItems[0] instanceof mongoose.Types.ObjectId);

      if (!needsTicketMigration && !needsMenuMigration) {
        console.log(`Event ${ev._id} already migrated. Skipping.`);
        continue;
      }

      const newTicketIds: mongoose.Types.ObjectId[] = [];
      const newMenuItemIds: mongoose.Types.ObjectId[] = [];

      if (needsTicketMigration) {
        console.log(`Migrating tickets for event ${ev._id} (${ev.name})`);
        for (const t of ev.tickets as any[]) {
          const created = await ticketModel.create([{ 
            name: t.name || t.type,
            price: Number(t.price) || 0,
            description: t.description || "",
            quantityAvailable: Number(t.quantityAvailable) || 0,
            quantitySold: Number(t.quantitySold) || 0,
          }], { session });
          if (created && created[0] && created[0]._id) {
            newTicketIds.push(created[0]._id);
          }
        }
      }

      if (needsMenuMigration) {
        console.log(`Migrating menu items for event ${ev._id} (${ev.name})`);
        for (const m of ev.menuItems as any[]) {
          const created = await MenuItem.create([{ 
            name: m.name,
            price: m.price?.toString?.() ?? String(m.price ?? ''),
            itemImage: m.itemImage || "",
            description: m.description || "",
            category: m.category || "",
            customCategory: m.customCategory || "",
          }], { session });
          if (created && created[0] && created[0]._id) {
            newMenuItemIds.push(created[0]._id);
          }
        }
      }

      const update: any = {};
      if (newTicketIds.length > 0) update.tickets = newTicketIds;
      if (newMenuItemIds.length > 0) update.menuItems = newMenuItemIds;

      if (Object.keys(update).length) {
        await eventModel.updateOne({ _id: ev._id }, { $set: update }, { session });
        console.log(`Updated event ${ev._id}`);
      }
    }

    await session.commitTransaction();
    console.log("Migration completed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    await session.abortTransaction();
    process.exit(1);
  } finally {
    session.endSession();
    await mongoose.disconnect();
  }
}

migrate();


