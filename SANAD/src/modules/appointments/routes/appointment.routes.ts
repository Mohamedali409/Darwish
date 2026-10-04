import { Router } from "express";
import { AppointmentController } from "../controllers/appointment.controller.js";
import { AppointmentService } from "../services/appointment.service.js";
import { AppointmentRepository } from "../repositories/appointment.repository.js";

const router = Router();

const repository = new AppointmentRepository();
const service = new AppointmentService(repository);
const controller = new AppointmentController(service);

router.get("/providers/:providerId/appointments", (req, res) =>
  controller.getProviderAppointments(req, res),
);

export default router;
