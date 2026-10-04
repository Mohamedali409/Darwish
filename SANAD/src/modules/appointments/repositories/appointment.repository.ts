import {
  AppointmentModel,
  type Appointment,
} from "../models/appointment.model.js";

export class AppointmentRepository {
  async findByProviderAndDateRange(
    providerId: string,
    startDate: Date,
    endDate: Date,
    status: Appointment["status"],
  ): Promise<Appointment[]> {
    return AppointmentModel.find({
      providerId,
      appointmentDate: {
        $gte: startDate,
        $lte: endDate,
      },
      status,
    })
      .sort({ appointmentDate: 1 })
      .lean();
  }
}
