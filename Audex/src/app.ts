import express from "express";
import referenceDataRoutes from "./modules/reference-data/routes/reference-data.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Audex API is running",
  });
});

app.use("/api/reference-data", referenceDataRoutes);

app.use(errorMiddleware);

export default app;
