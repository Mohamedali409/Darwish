import { describe, expect, it, vi } from "vitest";
import { ReferenceDataService } from "../src/modules/reference-data/services/reference-data.service.js";

describe("ReferenceDataService", () => {
  it("should fetch countries from repository when cache misses", async () => {
    const countries = [
      {
        name: "Egypt",
        code: "EG",
      },
      {
        name: "Saudi Arabia",
        code: "SA",
      },
    ];

    const countryRepository = {
      findAll: vi.fn().mockResolvedValue(countries),
    };

    const cacheService = {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    };

    const service = new ReferenceDataService(
      countryRepository as any,
      cacheService as any,
    );

    const result = await service.getCountries();

    expect(result).toEqual(countries);
    expect(cacheService.get).toHaveBeenCalled();
    expect(countryRepository.findAll).toHaveBeenCalledTimes(1);
    expect(cacheService.set).toHaveBeenCalledTimes(1);
  });

  it("should invalidate countries cache after updating a country", async () => {
    const updatedCountry = {
      name: "Egypt Updated",
      code: "EG",
    };

    const countryRepository = {
      findAll: vi.fn(),
      updateById: vi.fn().mockResolvedValue(updatedCountry),
    };

    const cacheService = {
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn().mockResolvedValue(undefined),
    };

    const service = new ReferenceDataService(
      countryRepository as any,
      cacheService as any,
    );

    const result = await service.updateCountry("6ac26b182d3dd0c1242c9237", {
      name: "Egypt Updated",
    });

    expect(result).toEqual(updatedCountry);

    expect(countryRepository.updateById).toHaveBeenCalledTimes(1);

    expect(cacheService.delete).toHaveBeenCalledTimes(1);

    expect(cacheService.delete).toHaveBeenCalledWith(
      "reference-data:countries",
    );
  });

  it("should return countries from cache when cache hits", async () => {
    const countries = [
      {
        name: "Egypt",
        code: "EG",
      },
      {
        name: "Saudi Arabia",
        code: "SA",
      },
    ];

    const countryRepository = {
      findAll: vi.fn(),
    };

    const cacheService = {
      get: vi.fn().mockResolvedValue(countries),
      set: vi.fn(),
      delete: vi.fn(),
    };

    const service = new ReferenceDataService(
      countryRepository as any,
      cacheService as any,
    );

    const result = await service.getCountries();

    expect(result).toEqual(countries);

    expect(cacheService.get).toHaveBeenCalledTimes(1);

    expect(countryRepository.findAll).not.toHaveBeenCalled();

    expect(cacheService.set).not.toHaveBeenCalled();
  });

  it("should throw 400 when country ID is invalid", async () => {
    const countryRepository = {
      findAll: vi.fn(),
      updateById: vi.fn(),
    };

    const cacheService = {
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
    };

    const service = new ReferenceDataService(
      countryRepository as any,
      cacheService as any,
    );

    await expect(
      service.updateCountry("123", {
        name: "Egypt Updated",
      }),
    ).rejects.toThrow("Invalid country ID");

    expect(countryRepository.updateById).not.toHaveBeenCalled();

    expect(cacheService.delete).not.toHaveBeenCalled();
  });

  it("should throw 404 when country is not found", async () => {
    const countryRepository = {
      findAll: vi.fn(),
      updateById: vi.fn().mockResolvedValue(null),
    };

    const cacheService = {
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
    };

    const service = new ReferenceDataService(
      countryRepository as any,
      cacheService as any,
    );

    await expect(
      service.updateCountry("6ac26b182d3dd0c1242c9237", {
        name: "Egypt Updated",
      }),
    ).rejects.toThrow("Country not found");

    expect(countryRepository.updateById).toHaveBeenCalledTimes(1);

    expect(cacheService.delete).not.toHaveBeenCalled();
  });
});
