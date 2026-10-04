import "dotenv/config";

import mongoose from "mongoose";
import { connectMongoDB } from "../infrastructure/database/mongodb.js";
import { AppointmentModel } from "../modules/appointments/models/appointment.model.js";

async function createIndexes(): Promise<void> {
  try {
    await connectMongoDB();

    const indexName = await AppointmentModel.collection.createIndex({
      providerId: 1,
      status: 1,
      appointmentDate: 1,
    });

    console.log(`Appointment index created: ${indexName}`);
  } catch (error) {
    console.error("Index creation failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

createIndexes();
