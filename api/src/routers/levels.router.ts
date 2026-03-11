import { Router } from "express";
import { checkRoles } from "../middlewares/access-control-middleware.ts";
import * as levelsController from "../controllers/levels.controller.ts";

export const router = Router();

/**
 * @openapi
 * /levels:
 *   get:
 *     tags: [Levels]
 *     summary: Liste de tous les niveaux
 *     responses:
 *       200:
 *         description: Tableau de niveaux
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Level' }
 */
router.get("/levels", checkRoles(["admin", "author", "member"]), levelsController.getAllLevels);

/**
 * @openapi
 * /levels/{id}:
 *   get:
 *     tags: [Levels]
 *     summary: Détail d'un niveau
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Niveau trouvé
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Level' }
 *       404:
 *         description: Niveau introuvable
 */
router.get("/levels/:id", checkRoles(["admin", "author", "member"]), levelsController.getOneLevel);

/**
 * @openapi
 * /levels:
 *   post:
 *     tags: [Levels]
 *     summary: Créer un niveau (admin uniquement)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *     responses:
 *       201:
 *         description: Niveau créé
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Level' }
 *       409:
 *         description: Nom déjà utilisé
 */
router.post("/levels", checkRoles(["admin"]), levelsController.createLevel);

/**
 * @openapi
 * /levels/{id}:
 *   patch:
 *     tags: [Levels]
 *     summary: Modifier un niveau (admin uniquement)
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
 *               name: { type: string }
 *     responses:
 *       200:
 *         description: Niveau modifié
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Level' }
 *       404:
 *         description: Niveau introuvable
 *       409:
 *         description: Nom déjà utilisé
 */
router.patch("/levels/:id", checkRoles(["admin"]), levelsController.updateLevel);

/**
 * @openapi
 * /levels/{id}:
 *   delete:
 *     tags: [Levels]
 *     summary: Supprimer un niveau (admin uniquement)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Niveau supprimé
 *       404:
 *         description: Niveau introuvable
 */
router.delete("/levels/:id", checkRoles(["admin"]), levelsController.deleteLevel);
