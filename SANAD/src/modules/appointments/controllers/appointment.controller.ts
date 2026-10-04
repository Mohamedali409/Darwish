import type { Request, Response } from "express";
import { AppointmentService } from "../services/appointment.service.js";

export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  async getProviderAppointments(req: Request, res: Response): Promise<void> {
    const { providerId } = req.params;

    if (typeof providerId !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid provider ID",
      });

      return;
    }

    const startDate = new Date(String(req.query.startDate));

    const endDate = new Date(String(req.query.endDate));

    const appointments = await this.appointmentService.getProviderAppointments(
      providerId,
      startDate,
      endDate,
    );

    res.status(200).json({
      success: true,
      data: appointments,
    });
  }
}
