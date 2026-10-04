import rateLimit from "express-rate-limit";

const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000);

const maxRequests = Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 10);

export function createRateLimiter(
  windowMsValue: number = windowMs,
  maxRequestsValue: number = maxRequests,
) {
  return rateLimit({
    windowMs: windowMsValue,
    limit: maxRequestsValue,

    standardHeaders: true,
    legacyHeaders: false,

    message: {
      success: false,
      message: "Too many requests. Please try again later.",
    },
  });
}

export const referenceDataRateLimiter = createRateLimiter();
