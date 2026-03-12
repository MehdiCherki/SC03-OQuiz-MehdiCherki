import { Router } from "express";
import { checkRoles } from "../middlewares/access-control-middleware.ts";
import * as choicesController from "../controllers/choices.controller.ts";

export const router = Router();

/**
 * @openapi
 * /choices/{id}:
 *   patch:
 *     tags: [Choices]
 *     summary: Modifier un choix (auteur propriétaire ou admin)
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
 *               is_valid:    { type: boolean }
 *     responses:
 *       200:
 *         description: Choix modifié
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Choice' }
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Choix introuvable
 */
router.patch(
  "/choices/:id",
  checkRoles(["admin", "author"]),
  choicesController.updateChoice,
);

/**
 * @openapi
 * /choices/{id}:
 *   delete:
 *     tags: [Choices]
 *     summary: Supprimer un choix (auteur propriétaire ou admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Choix supprimé
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Choix introuvable
 */
router.delete(
  "/choices/:id",
  checkRoles(["admin", "author"]),
  choicesController.deleteChoice,
);
