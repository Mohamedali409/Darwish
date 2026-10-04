import { CountryModel, type Country } from "../models/country.model.js";

export class CountryRepository {
  async findAll(): Promise<Country[]> {
    return CountryModel.find().lean();
  }

  async updateById(
    id: string,
    data: Partial<Pick<Country, "name" | "code">>,
  ): Promise<Country | null> {
    return CountryModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).lean();
  }
}
