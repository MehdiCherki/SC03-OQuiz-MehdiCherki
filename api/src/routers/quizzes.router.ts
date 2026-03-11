import { Router } from "express";
import { checkRoles } from "../middlewares/access-control-middleware.ts";
import * as quizzesController from "../controllers/quizzes.controller.ts";
import * as attemptsController from "../controllers/attempts.controller.ts";

export const router = Router();

/**
 * @openapi
 * /quizzes:
 *   get:
 *     tags: [Quizzes]
 *     summary: Liste de tous les quizzes
 *     responses:
 *       200:
 *         description: Tableau de quizzes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Quiz' }
 */
/**
 * @openapi
 * /quizzes/recent:
 *   get:
 *     tags: [Quizzes]
 *     summary: Les 6 quizzes les plus récents (public)
 *     security: []
 *     responses:
 *       200:
 *         description: Tableau de 6 quizzes maximum
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Quiz' }
 */
router.get("/quizzes/recent", quizzesController.getRecentQuizzes);

router.get("/quizzes", checkRoles(["admin", "author", "member"]), quizzesController.getAllQuizzes);

/**
 * @openapi
 * /quizzes/{id}:
 *   get:
 *     tags: [Quizzes]
 *     summary: Détail d'un quiz (avec ses questions et choix)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Quiz avec questions et choix
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Quiz' }
 *       404:
 *         description: Quiz introuvable
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get("/quizzes/:id", checkRoles(["admin", "author", "member"]), quizzesController.getOneQuiz);

/**
 * @openapi
 * /quizzes/{id}/questions:
 *   get:
 *     tags: [Quizzes]
 *     summary: Questions et choix d'un quiz
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Tableau de questions avec leurs choix
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Question' }
 *       404:
 *         description: Quiz introuvable
 */
router.get("/quizzes/:id/questions", checkRoles(["admin", "author", "member"]), quizzesController.getQuizQuestions);

/**
 * @openapi
 * /quizzes/{id}/attempts:
 *   get:
 *     tags: [Quizzes]
 *     summary: Tentatives d'un quiz (auteur du quiz ou admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Tableau de tentatives avec l'utilisateur associé
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Attempt' }
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Quiz introuvable
 */
router.get("/quizzes/:id/attempts", checkRoles(["admin", "author"]), attemptsController.getQuizAttempts);

/**
 * @openapi
 * /quizzes:
 *   post:
 *     tags: [Quizzes]
 *     summary: Créer un quiz
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:       { type: string }
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Quiz créé
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Quiz' }
 */
router.post("/quizzes", checkRoles(["admin", "author"]), quizzesController.createQuiz);

/**
 * @openapi
 * /quizzes/{id}/attempts:
 *   post:
 *     tags: [Quizzes]
 *     summary: Enregistrer une tentative de quiz
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
 *             type: array
 *             items:
 *               type: object
 *               required: [question_id, user_choice_id]
 *               properties:
 *                 question_id:    { type: integer }
 *                 user_choice_id: { type: integer }
 *     responses:
 *       201:
 *         description: Résultat de la tentative
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 attempt: { $ref: '#/components/schemas/Attempt' }
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       question_id:    { type: integer }
 *                       user_choice_id: { type: integer }
 *                       good_choice_id: { type: integer }
 *                       is_correct:     { type: boolean }
 */
router.post("/quizzes/:id/attempts", checkRoles(["admin", "author", "member"]), attemptsController.createAttempt);

/**
 * @openapi
 * /quizzes/{id}:
 *   patch:
 *     tags: [Quizzes]
 *     summary: Modifier un quiz (auteur propriétaire ou admin)
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
 *               title:       { type: string }
 *               description: { type: string, nullable: true }
 *     responses:
 *       200:
 *         description: Quiz modifié
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Quiz' }
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Quiz introuvable
 */
router.patch("/quizzes/:id", checkRoles(["admin", "author"]), quizzesController.updateQuiz);

/**
 * @openapi
 * /quizzes/{id}/tags/{tagId}:
 *   put:
 *     tags: [Quizzes]
 *     summary: Associer un tag à un quiz (auteur propriétaire ou admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: tagId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Tag associé
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Quiz ou tag introuvable
 */
router.put("/quizzes/:id/tags/:tagId", checkRoles(["admin", "author"]), quizzesController.addTagToQuiz);

/**
 * @openapi
 * /quizzes/{id}/tags/{tagId}:
 *   delete:
 *     tags: [Quizzes]
 *     summary: Retirer un tag d'un quiz (auteur propriétaire ou admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: tagId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Tag retiré
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Quiz ou association introuvable
 */
router.delete("/quizzes/:id/tags/:tagId", checkRoles(["admin", "author"]), quizzesController.removeTagFromQuiz);

/**
 * @openapi
 * /quizzes/{id}:
 *   delete:
 *     tags: [Quizzes]
 *     summary: Supprimer un quiz (auteur propriétaire ou admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Quiz supprimé
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Quiz introuvable
 */
router.delete("/quizzes/:id", checkRoles(["admin", "author"]), quizzesController.deleteQuiz);
