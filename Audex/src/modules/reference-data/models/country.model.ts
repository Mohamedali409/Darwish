import { Schema, model, type InferSchemaType } from "mongoose";

const countrySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

export type Country = InferSchemaType<typeof countrySchema>;

export const CountryModel = model("Country", countrySchema);
