import app from "./app.js";
import { connectMongoDB } from "./infrastructure/database/mongodb.js";
import { PORT } from "./config/env.js";

async function bootstrap(): Promise<void> {
  try {
    await connectMongoDB();

    app.listen(PORT, () => {
      console.log(`SANAD API running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Application startup failed:", error);
    process.exit(1);
  }
}

bootstrap();
