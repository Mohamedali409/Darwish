import "dotenv/config";

import mongoose from "mongoose";
import { connectMongoDB } from "../infrastructure/database/mongodb.js";
import { ProviderModel } from "../modules/providers/models/provider.model.js";
import { AppointmentModel } from "../modules/appointments/models/appointment.model.js";

async function seed(): Promise<void> {
  try {
    await connectMongoDB();

    await AppointmentModel.deleteMany({});
    await ProviderModel.deleteMany({});

    const providers = await ProviderModel.insertMany([
      {
        name: "Dr. Ahmed Hassan",
        specialty: "Cardiology",
      },
      {
        name: "Dr. Mohamed Ali",
        specialty: "Dermatology",
      },
      {
        name: "Dr. Sara Mahmoud",
        specialty: "Pediatrics",
      },
      {
        name: "Dr. Omar Khaled",
        specialty: "Neurology",
      },
      {
        name: "Dr. Nour Adel",
        specialty: "Dentistry",
      },
    ]);

    const appointments = [];

    const statuses = ["scheduled", "completed", "cancelled"] as const;

    for (let i = 0; i < 10_000; i++) {
      const provider = providers[i % providers.length];

      if (!provider) {
        throw new Error("Provider was not created");
      }

      const daysFromNow = i % 60;

      const appointmentDate = new Date();

      appointmentDate.setDate(appointmentDate.getDate() + daysFromNow);

      appointments.push({
        providerId: provider._id,
        patientName: `Patient ${i + 1}`,
        appointmentDate,
        status: statuses[i % statuses.length],
      });
    }

    await AppointmentModel.insertMany(appointments);

    console.log(
      `Seed completed: ${providers.length} providers and ${appointments.length} appointments`,
    );
  } catch (error) {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seed();
