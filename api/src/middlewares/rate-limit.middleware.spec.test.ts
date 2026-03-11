import assert from "node:assert";
import { describe, it } from "node:test";
import { RATE_LIMIT } from "./rate-limit.middleware.ts";

const BASE_URL = `http://localhost:${process.env.PORT ?? 7357}/api`;

// Payload invalide volontairement : on veut tester le rate limiter, pas le controller
const invalidLoginPayload = JSON.stringify({ email: "unknown@test.io", password: "wrong" });
const loginHeaders = { "Content-Type": "application/json" };

async function postLogin() {
  return fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: loginHeaders,
    body: invalidLoginPayload,
  });
}

describe("authRateLimiter", () => {
  // Chaque test démarre avec un compteur frais (resetRateLimiters() dans beforeEach global)

  it("should include RateLimit headers on rate-limited routes", async () => {
    const response = await postLogin();

    assert.ok(response.headers.get("ratelimit-limit"), "RateLimit-Limit doit être présent");
    assert.ok(response.headers.get("ratelimit-remaining"), "RateLimit-Remaining doit être présent");
    assert.ok(response.headers.get("ratelimit-reset"), "RateLimit-Reset doit être présent");
  });

  it("should report the correct limit in the RateLimit-Limit header", async () => {
    const response = await postLogin();

    assert.strictEqual(response.headers.get("ratelimit-limit"), String(RATE_LIMIT));
  });

  it("should decrement RateLimit-Remaining on each request", async () => {
    const r1 = await postLogin();
    const r2 = await postLogin();

    const remaining1 = parseInt(r1.headers.get("ratelimit-remaining") ?? "-1");
    const remaining2 = parseInt(r2.headers.get("ratelimit-remaining") ?? "-1");

    assert.ok(remaining2 < remaining1, "RateLimit-Remaining doit décroître à chaque requête");
  });

  it("should return 429 after exceeding the limit", async () => {
    // Épuise le quota (RATE_LIMIT requêtes autorisées, la suivante est bloquée)
    for (let i = 0; i < RATE_LIMIT; i++) {
      await postLogin();
    }
    const response = await postLogin();

    assert.strictEqual(response.status, 429);
  });

  it("should return the configured error message on 429", async () => {
    for (let i = 0; i < RATE_LIMIT; i++) {
      await postLogin();
    }
    const response = await postLogin();
    const body = await response.json() as { error: string };

    assert.strictEqual(response.status, 429);
    assert.match(body.error, /Trop de tentatives/);
  });

  it("should NOT include RateLimit headers on non-rate-limited routes", async () => {
    // GET /quizzes/recent n'est pas protégé par le rate limiter
    const response = await fetch(`${BASE_URL}/quizzes/recent`);

    assert.strictEqual(response.headers.get("ratelimit-limit"), null);
    assert.strictEqual(response.headers.get("ratelimit-remaining"), null);
  });

  it("login and register should have independent counters", async () => {
    // Épuise le quota de login
    for (let i = 0; i < RATE_LIMIT; i++) {
      await postLogin();
    }

    // register doit encore fonctionner normalement (pas de 429)
    const registerResponse = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: loginHeaders,
      body: JSON.stringify({ firstname: "A", lastname: "B", email: "a@b.io", password: "Password1!" }),
    });

    assert.notStrictEqual(registerResponse.status, 429, "Le register ne doit pas être affecté par le quota login");
  });
});
