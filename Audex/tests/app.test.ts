import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("Application", () => {
  it("should return API health status", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      success: true,
      message: "Audex API is running",
    });
  });
});
