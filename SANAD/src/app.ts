import express from "express";
import appointmentRoutes from "./modules/appointments/routes/appointment.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "SANAD API is running",
  });
});

app.use("/api/appointments", appointmentRoutes);

app.use(errorMiddleware);

export default app;
