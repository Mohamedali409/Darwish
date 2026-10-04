import "dotenv/config";

import mongoose from "mongoose";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { connectMongoDB } from "../src/infrastructure/database/mongodb.js";
import { ProviderModel } from "../src/modules/providers/models/provider.model.js";
import { AppointmentModel } from "../src/modules/appointments/models/appointment.model.js";
import { AppointmentAuditModel } from "../src/modules/appointments/models/appointment-audit.model.js";
import { AppointmentBookingService } from "../src/modules/appointments/services/appointment-booking.service.js";

describe("Appointment Transaction", () => {
  let providerId: string;
  let service: AppointmentBookingService;

  beforeAll(async () => {
    await connectMongoDB();

    await AppointmentModel.deleteMany({});
    await AppointmentAuditModel.deleteMany({});
    await ProviderModel.deleteMany({});

    const provider = await ProviderModel.create({
      name: "Dr. Ahmed Hassan",
      specialty: "Cardiology",
    });

    providerId = provider._id.toString();

    service = new AppointmentBookingService();
  });

  beforeEach(async () => {
    await AppointmentModel.deleteMany({});
    await AppointmentAuditModel.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it("should commit appointment and audit together", async () => {
    const appointment = await service.bookAppointment(
      providerId,
      "Patient Test",
      new Date(Date.now() + 24 * 60 * 60 * 1000),
    );

    expect(appointment).toBeDefined();

    const appointments = await AppointmentModel.countDocuments();

    const audits = await AppointmentAuditModel.countDocuments();

    expect(appointments).toBe(1);
    expect(audits).toBe(1);
  });

  it("should rollback appointment when audit creation fails", async () => {
    const createSpy = vi
      .spyOn(AppointmentAuditModel, "create")
      .mockRejectedValueOnce(new Error("Audit persistence failed"));

    await expect(
      service.bookAppointment(
        providerId,
        "Patient Rollback",
        new Date(Date.now() + 24 * 60 * 60 * 1000),
      ),
    ).rejects.toThrow("Audit persistence failed");

    const appointments = await AppointmentModel.countDocuments();

    const audits = await AppointmentAuditModel.countDocuments();

    expect(appointments).toBe(0);
    expect(audits).toBe(0);

    createSpy.mockRestore();
  });

  it("should validate before starting the workflow", async () => {
    await expect(
      service.bookAppointment(
        providerId,
        "Patient Invalid",
        new Date(Date.now() - 1000),
      ),
    ).rejects.toThrow("Appointment date must be in the future");

    expect(await AppointmentModel.countDocuments()).toBe(0);
  });
});
