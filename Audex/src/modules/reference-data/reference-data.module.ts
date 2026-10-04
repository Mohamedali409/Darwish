import { RedisCacheService } from "../../infrastructure/redis/redis-cache.service.js";
import { ReferenceDataController } from "./controllers/reference-data.controller.js";
import { CountryRepository } from "./repositories/country.repository.js";
import { ReferenceDataService } from "./services/reference-data.service.js";

const countryRepository = new CountryRepository();

const cacheService = new RedisCacheService();

const referenceDataService = new ReferenceDataService(
  countryRepository,
  cacheService,
);

export const referenceDataController = new ReferenceDataController(
  referenceDataService,
);
