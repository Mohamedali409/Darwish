import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createRateLimiter } from "../src/middlewares/rate-limit.middleware.js";

describe("Rate Limiting", () => {
  it("should allow requests under the limit and reject requests over the limit", async () => {
    const app = express();

    const limiter = createRateLimiter(60_000, 2);

    app.get("/test", limiter, (_req, res) => {
      res.status(200).json({
        success: true,
      });
    });

    const firstRequest = await request(app).get("/test");

    const secondRequest = await request(app).get("/test");

    const thirdRequest = await request(app).get("/test");

    expect(firstRequest.status).toBe(200);
    expect(secondRequest.status).toBe(200);

    expect(thirdRequest.status).toBe(429);

    expect(thirdRequest.body).toEqual({
      success: false,
      message: "Too many requests. Please try again later.",
    });
  });
});
