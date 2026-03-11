import { Router } from "express";
import { checkRoles } from "../middlewares/access-control-middleware.ts";
import * as questionsController from "../controllers/questions.controller.ts";

export const router = Router();

/**
 * @openapi
 * /quizzes/{id}/questions:
 *   post:
 *     tags: [Questions]
 *     summary: Ajouter une question à un quiz (auteur propriétaire ou admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [description]
 *             properties:
 *               description: { type: string }
 *               level_id:    { type: integer }
 *     responses:
 *       201:
 *         description: Question créée
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Question' }
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Quiz introuvable
 */
router.post("/quizzes/:id/questions", checkRoles(["admin", "author"]), questionsController.createQuestion);

/**
 * @openapi
 * /questions/{id}:
 *   patch:
 *     tags: [Questions]
 *     summary: Modifier une question (auteur propriétaire ou admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description: { type: string }
 *               level_id:    { type: integer, nullable: true }
 *     responses:
 *       200:
 *         description: Question modifiée
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Question' }
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Question introuvable
 */
router.patch("/questions/:id", checkRoles(["admin", "author"]), questionsController.updateQuestion);

/**
 * @openapi
 * /questions/{id}:
 *   delete:
 *     tags: [Questions]
 *     summary: Supprimer une question et ses choix (auteur propriétaire ou admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Question supprimée
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Question introuvable
 */
router.delete("/questions/:id", checkRoles(["admin", "author"]), questionsController.deleteQuestion);

/**
 * @openapi
 * /questions/{id}/choices:
 *   post:
 *     tags: [Questions]
 *     summary: Ajouter un choix à une question (auteur propriétaire ou admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [description, is_valid]
 *             properties:
 *               description: { type: string }
 *               is_valid:    { type: boolean }
 *     responses:
 *       201:
 *         description: Choix créé
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Choice' }
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Question introuvable
 */
router.post("/questions/:id/choices", checkRoles(["admin", "author"]), questionsController.createChoice);
