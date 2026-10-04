import { Schema, model, type InferSchemaType } from "mongoose";

const appointmentSchema = new Schema(
  {
    providerId: {
      type: Schema.Types.ObjectId,
      ref: "Provider",
      required: true,
    },

    patientName: {
      type: String,
      required: true,
      trim: true,
    },

    appointmentDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export type Appointment = InferSchemaType<typeof appointmentSchema>;

export const AppointmentModel = model("Appointment", appointmentSchema);
