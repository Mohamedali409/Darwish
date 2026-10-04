import { Router } from "express";
import { validateBody } from "../../../middlewares/validate.middleware.js";
import { referenceDataRateLimiter } from "../../../middlewares/rate-limit.middleware.js";
import { updateCountrySchema } from "../validation/country.validation.js";
import { referenceDataController } from "../reference-data.module.js";

const router = Router();

router.get("/countries", referenceDataRateLimiter, (req, res) =>
  referenceDataController.getCountries(req, res),
);

router.put("/countries/:id", validateBody(updateCountrySchema), (req, res) =>
  referenceDataController.updateCountry(req, res),
);

export default router;
