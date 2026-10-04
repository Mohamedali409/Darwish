import type { Country } from "../models/country.model.js";
import { CountryRepository } from "../repositories/country.repository.js";
import { RedisCacheService } from "../../../infrastructure/redis/redis-cache.service.js";
import { AppError } from "../../../middlewares/app-error.js";
import { isValidCountryId } from "../validation/country.validation.js";

const COUNTRIES_CACHE_KEY = "reference-data:countries";
const COUNTRIES_CACHE_TTL = 60 * 60;

export class ReferenceDataService {
  constructor(
    private readonly countryRepository: CountryRepository,
    private readonly cacheService: RedisCacheService,
  ) {}

  async getCountries(): Promise<Country[]> {
    const cachedCountries =
      await this.cacheService.get<Country[]>(COUNTRIES_CACHE_KEY);

    if (cachedCountries) {
      console.log("Countries cache HIT");

      return cachedCountries;
    }

    console.log("Countries cache MISS");

    const countries = await this.countryRepository.findAll();

    await this.cacheService.set(
      COUNTRIES_CACHE_KEY,
      countries,
      COUNTRIES_CACHE_TTL,
    );

    return countries;
  }

  async updateCountry(
    id: string,
    data: Partial<Pick<Country, "name" | "code">>,
  ): Promise<Country> {
    if (!isValidCountryId(id)) {
      throw new AppError(400, "Invalid country ID");
    }

    const updatedCountry = await this.countryRepository.updateById(id, data);

    if (!updatedCountry) {
      throw new AppError(404, "Country not found");
    }

    await this.cacheService.delete(COUNTRIES_CACHE_KEY);

    console.log("Countries cache INVALIDATED");

    return updatedCountry;
  }
}
