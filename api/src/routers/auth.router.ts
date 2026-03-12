import { Router } from "express";
import * as authController from "../controllers/auth.controller.ts";
import { checkRoles } from "../middlewares/access-control-middleware.ts";
import {
  registerRateLimiter,
  loginRateLimiter,
  refreshRateLimiter,
} from "../middlewares/rate-limit.middleware.ts";

export const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Inscription d'un nouvel utilisateur
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstname, lastname, email, password]
 *             properties:
 *               firstname: { type: string }
 *               lastname:  { type: string }
 *               email:     { type: string, format: email }
 *               password:  { type: string, format: password }
 *     responses:
 *       201:
 *         description: Utilisateur créé
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/User' }
 *       409:
 *         description: Email déjà utilisé
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post("/auth/register", registerRateLimiter, authController.registerUser);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Connexion
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, format: email }
 *               password: { type: string, format: password }
 *     responses:
 *       200:
 *         description: Tokens d'accès et de rafraîchissement
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:  { type: string }
 *                 refreshToken: { type: string }
 *       401:
 *         description: Identifiants invalides
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post("/auth/login", loginRateLimiter, authController.loginUser);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Déconnexion (révoque le refresh token)
 *     responses:
 *       204:
 *         description: Déconnecté
 */
router.post(
  "/auth/logout",
  checkRoles(["member", "author", "admin"]),
  authController.logoutUser,
);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Renouvellement de l'access token
 *     security: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: Nouveaux tokens
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:  { type: string }
 *                 refreshToken: { type: string }
 *       401:
 *         description: Refresh token invalide ou expiré
 */
router.post(
  "/auth/refresh",
  refreshRateLimiter,
  authController.refreshAccessToken,
);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Informations de l'utilisateur connecté
 *     responses:
 *       200:
 *         description: Profil de l'utilisateur authentifié
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/User' }
 *       401:
 *         description: Non authentifié
 */
router.get(
  "/auth/me",
  checkRoles(["member", "author", "admin"]),
  authController.getAuthenticatedUser,
);
