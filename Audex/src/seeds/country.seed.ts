import "dotenv/config";

import { connectMongoDB } from "../infrastructure/database/mongodb.js";
import { CountryModel } from "../modules/reference-data/models/country.model.js";

const countries = [
  {
    name: "Egypt",
    code: "EG",
  },
  {
    name: "Saudi Arabia",
    code: "SA",
  },
  {
    name: "United Arab Emirates",
    code: "AE",
  },
  {
    name: "Kuwait",
    code: "KW",
  },
];

async function seedCountries(): Promise<void> {
  try {
    await connectMongoDB();

    await CountryModel.deleteMany({});

    await CountryModel.insertMany(countries);

    console.log("Countries seeded successfully");

    process.exit(0);
  } catch (error) {
    console.error("Country seeding failed:", error);
    process.exit(1);
  }
}

seedCountries();
