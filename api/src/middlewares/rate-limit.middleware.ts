import { rateLimit } from "express-rate-limit";
import type { RequestHandler } from "express";

const LIMIT = process.env.RATE_LIMIT_MAX
  ? parseInt(process.env.RATE_LIMIT_MAX)
  : 10;

function createLimiter() {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // fenêtre de 15 minutes
    limit: LIMIT,
    standardHeaders: "draft-6", // headers séparés : RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset
    message: { error: "Trop de tentatives, réessayez dans 15 minutes." },
  });
}

// Instances séparées par route pour que chaque endpoint ait son propre compteur
const limiters = {
  register: createLimiter(),
  login: createLimiter(),
  refresh: createLimiter(),
};

// Proxies stables attachés au routeur — délèguent à l'instance courante (remplaçable via resetRateLimiters)
export const registerRateLimiter: RequestHandler = (req, res, next) =>
  limiters.register(req, res, next);
export const loginRateLimiter: RequestHandler = (req, res, next) =>
  limiters.login(req, res, next);
export const refreshRateLimiter: RequestHandler = (req, res, next) =>
  limiters.refresh(req, res, next);

// Réinitialise les compteurs — à appeler dans le beforeEach des tests
export function resetRateLimiters() {
  limiters.register = createLimiter();
  limiters.login = createLimiter();
  limiters.refresh = createLimiter();
}

export { LIMIT as RATE_LIMIT };
