import { Schema, model, type InferSchemaType } from "mongoose";

const providerSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    specialty: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

export type Provider = InferSchemaType<typeof providerSchema>;

export const ProviderModel = model("Provider", providerSchema);
