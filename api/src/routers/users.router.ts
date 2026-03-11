import { Router } from "express";
import * as usersController from "../controllers/users.controller.ts";
import { checkRoles } from "../middlewares/access-control-middleware.ts";

export const router = Router();

/**
 * @openapi
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: Liste de tous les utilisateurs (admin uniquement)
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *         description: Nombre maximum d'utilisateurs à retourner
 *     responses:
 *       200:
 *         description: Tableau d'utilisateurs (sans mot de passe)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/User' }
 */
router.get("/users", checkRoles(["admin"]), usersController.getAllUsers);

/**
 * @openapi
 * /users/{id}/profile:
 *   get:
 *     tags: [Users]
 *     summary: Profil d'un utilisateur avec le nombre de quizzes joués
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Profil de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - { $ref: '#/components/schemas/User' }
 *                 - type: object
 *                   properties:
 *                     nb_quiz_played: { type: integer }
 *       404:
 *         description: Utilisateur introuvable
 */
router.get("/users/:id/profile", checkRoles(["admin", "author", "member"]), usersController.getUserProfile);

/**
 * @openapi
 * /users/{id}/attempts:
 *   get:
 *     tags: [Users]
 *     summary: Tentatives d'un utilisateur (soi-même ou admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Tableau de tentatives avec le quiz associé
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Attempt' }
 *       403:
 *         description: Accès refusé (tentatives d'un autre utilisateur)
 *       404:
 *         description: Utilisateur introuvable
 */
router.get("/users/:id/attempts", checkRoles(["admin", "author", "member"]), usersController.getUserAttempts);
