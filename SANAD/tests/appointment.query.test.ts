import "dotenv/config";

import mongoose from "mongoose";
import { beforeAll, afterAll, describe, expect, it } from "vitest";

import { connectMongoDB } from "../src/infrastructure/database/mongodb.js";
import { ProviderModel } from "../src/modules/providers/models/provider.model.js";
import { AppointmentModel } from "../src/modules/appointments/models/appointment.model.js";

describe("Appointment Query Optimization", () => {
  beforeAll(async () => {
    await connectMongoDB();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it("should use the appointment compound index", async () => {
    const provider = await ProviderModel.findOne();

    expect(provider).not.toBeNull();

    if (!provider) {
      return;
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

    const winningPlan = result.queryPlanner.winningPlan;

    const ixScan =
      "inputStage" in winningPlan && winningPlan.inputStage?.stage === "IXSCAN"
        ? winningPlan.inputStage
        : null;

    expect(ixScan).not.toBeNull();

    expect(result.executionStats.totalDocsExamined).toBeLessThanOrEqual(
      result.executionStats.nReturned,
    );
  });
});
