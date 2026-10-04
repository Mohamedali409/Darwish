import "dotenv/config";

import mongoose from "mongoose";
import { AppointmentModel } from "../modules/appointments/models/appointment.model.js";
import { connectMongoDB } from "../infrastructure/database/mongodb.js";
import { ProviderModel } from "../modules/providers/models/provider.model.js";

async function explainQuery(): Promise<void> {
  try {
    await connectMongoDB();

    const provider = await ProviderModel.findOne();

    if (!provider) {
      throw new Error("No provider found. Run npm run seed first.");
    }

    const startDate = new Date();
    const endDate = new Date();

    endDate.setDate(endDate.getDate() + 30);

    const result = await AppointmentModel.find({
      providerId: provider._id,
      appointmentDate: {
        $gte: startDate,
        $lte: endDate,
      },
      status: "scheduled",
    })
      .sort({ appointmentDate: 1 })
      .explain("executionStats");

    console.dir(result, {
      depth: null,
    });
  } catch (error) {
    console.error("Explain failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

explainQuery();
