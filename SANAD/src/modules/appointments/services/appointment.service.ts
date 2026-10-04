import { AppointmentRepository } from "../repositories/appointment.repository.js";

export class AppointmentService {
  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  async getProviderAppointments(
    providerId: string,
    startDate: Date,
    endDate: Date,
  ) {
    return this.appointmentRepository.findByProviderAndDateRange(
      providerId,
      startDate,
      endDate,
      "scheduled",
    );
  }
}
