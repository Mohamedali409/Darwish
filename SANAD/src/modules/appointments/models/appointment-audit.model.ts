import { Schema, model, type InferSchemaType } from "mongoose";

const appointmentAuditSchema = new Schema(
  {
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },

    providerId: {
      type: Schema.Types.ObjectId,
      ref: "Provider",
      required: true,
    },

    action: {
      type: String,
      enum: ["created"],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export type AppointmentAudit = InferSchemaType<typeof appointmentAuditSchema>;

export const AppointmentAuditModel = model(
  "AppointmentAudit",
  appointmentAuditSchema,
);
