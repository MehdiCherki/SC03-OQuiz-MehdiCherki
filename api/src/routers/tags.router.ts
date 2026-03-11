import { Router } from "express";
import { checkRoles } from "../middlewares/access-control-middleware.ts";
import * as tagsController from "../controllers/tags.controller.ts";

export const router = Router();

/**
 * @openapi
 * /tags:
 *   get:
 *     tags: [Tags]
 *     summary: Liste de tous les tags (avec sous-tags)
 *     responses:
 *       200:
 *         description: Tableau de tags
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Tag' }
 */
router.get("/tags", checkRoles(["admin", "author", "member"]), tagsController.getAllTags);

/**
 * @openapi
 * /tags/{id}:
 *   get:
 *     tags: [Tags]
 *     summary: Détail d'un tag (avec ses sous-tags)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Tag trouvé
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Tag' }
 *       404:
 *         description: Tag introuvable
 */
router.get("/tags/:id", checkRoles(["admin", "author", "member"]), tagsController.getOneTag);

/**
 * @openapi
 * /tags:
 *   post:
 *     tags: [Tags]
 *     summary: Créer un tag (auteur ou admin)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:          { type: string }
 *               parent_tag_id: { type: integer, nullable: true }
 *     responses:
 *       201:
 *         description: Tag créé
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Tag' }
 *       409:
 *         description: Nom déjà utilisé
 */
router.post("/tags", checkRoles(["admin", "author"]), tagsController.createTag);

/**
 * @openapi
 * /tags/{id}:
 *   patch:
 *     tags: [Tags]
 *     summary: Modifier un tag (admin uniquement)
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
 *               name:          { type: string }
 *               parent_tag_id: { type: integer, nullable: true }
 *     responses:
 *       200:
 *         description: Tag modifié
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Tag' }
 *       404:
 *         description: Tag introuvable
 *       409:
 *         description: Nom déjà utilisé
 */
router.patch("/tags/:id", checkRoles(["admin"]), tagsController.updateTag);

/**
 * @openapi
 * /tags/{id}:
 *   delete:
 *     tags: [Tags]
 *     summary: Supprimer un tag (admin uniquement)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Tag supprimé
 *       404:
 *         description: Tag introuvable
 */
router.delete("/tags/:id", checkRoles(["admin"]), tagsController.deleteTag);
