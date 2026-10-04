import mongoose from "mongoose";
import { ProviderModel } from "../../providers/models/provider.model.js";
import { AppointmentModel } from "../models/appointment.model.js";
import { AppointmentAuditModel } from "../models/appointment-audit.model.js";

export class AppointmentBookingService {
  async bookAppointment(
    providerId: string,
    patientName: string,
    appointmentDate: Date,
  ) {
    if (appointmentDate <= new Date()) {
      throw new Error("Appointment date must be in the future");
    }

    const session = await mongoose.startSession();

    try {
      const appointment = await session.withTransaction(async () => {
        const provider =
          await ProviderModel.findById(providerId).session(session);

        if (!provider) {
          throw new Error("Provider not found");
        }

        const createdAppointments = await AppointmentModel.create(
          [
            {
              providerId,
              patientName,
              appointmentDate,
              status: "scheduled",
            },
          ],
          { session },
        );

        const createdAppointment = createdAppointments[0];

        if (!createdAppointment) {
          throw new Error("Appointment was not created");
        }

        await AppointmentAuditModel.create(
          [
            {
              appointmentId: createdAppointment._id,
              providerId,
              action: "created",
            },
          ],
          { session },
        );

        return createdAppointment;
      });

      return appointment;
    } finally {
      await session.endSession();
    }
  }
}
