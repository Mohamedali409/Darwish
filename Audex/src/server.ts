import "dotenv/config";

import app from "./app.js";
import { connectMongoDB } from "./infrastructure/database/mongodb.js";
import { connectRedis } from "./infrastructure/redis/redis.js";

const PORT = process.env.PORT || 3000;

async function bootstrap(): Promise<void> {
  try {
    await connectMongoDB();
    await connectRedis();

    app.listen(PORT, () => {
      console.log(`Audex API running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Application startup failed:", error);
    process.exit(1);
  }
}

bootstrap();
