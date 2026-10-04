import type { Request, Response } from "express";
import { ReferenceDataService } from "../services/reference-data.service.js";
import { AppError } from "../../../middlewares/app-error.js";

export class ReferenceDataController {
  constructor(private readonly referenceDataService: ReferenceDataService) {}

  async getCountries(_req: Request, res: Response): Promise<void> {
    const countries = await this.referenceDataService.getCountries();

    res.status(200).json({
      success: true,
      data: countries,
    });
  }

  async updateCountry(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (typeof id !== "string") {
      throw new AppError(400, "Invalid country ID");
    }

    const updatedCountry = await this.referenceDataService.updateCountry(
      id,
      req.body,
    );

    res.status(200).json({
      success: true,
      data: updatedCountry,
    });
  }
}
