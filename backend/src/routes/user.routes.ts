import { Router } from "express";
import { UserController } from "../controllers/user.controller";

const router = Router();

/**
 * @swagger
 * /api/users/{userId}:
 *   get:
 *     summary: Get user profile by user ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *         example: 019ec533-217f-7396-8d14-ec8f632ca8a7
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User profile retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 019ec533-217f-7396-8d14-ec8f632ca8a7
 *                     email:
 *                       type: string
 *                       example: test@example.com
 *                     role:
 *                       type: string
 *                       enum: [user, admin]
 *                       example: user
 *                     is_active:
 *                       type: boolean
 *                       example: true
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-01-14T10:00:00.000Z
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-01-14T10:00:00.000Z
 *                 error:
 *                   type: string
 *                   nullable: true
 *       400:
 *         description: Missing user ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User ID is required
 *                 data:
 *                   type: null
 *                 error:
 *                   type: string
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *                 data:
 *                   type: null
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 */
router.get("/users/:userId", UserController.getUserProfile);

/**
 * @swagger
 * /api/users/by-email:
 *   get:
 *     summary: Get user profile by email
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: User email
 *         example: user@example.com
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User profile retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     is_active:
 *                       type: boolean
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                 error:
 *                   type: string
 *                   nullable: true
 *       400:
 *         description: Missing email
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get("/users/by-email", UserController.getUserProfileByEmail);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (with pagination and filters)
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         required: false
 *         description: Page number
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         required: false
 *         description: Number of users per page
 *         example: 10
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, admin]
 *         required: false
 *         description: Filter by user role
 *         example: user
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Search by email or user ID
 *         example: test@example.com
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *         required: false
 *         description: Filter by active status
 *         example: true
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Users retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: 019ec533-217f-7396-8d14-ec8f632ca8a7
 *                       email:
 *                         type: string
 *                         example: user@example.com
 *                       role:
 *                         type: string
 *                         example: user
 *                       is_active:
 *                         type: boolean
 *                         example: true
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-01-14T10:00:00.000Z
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-01-14T10:00:00.000Z
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 25
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *                 error:
 *                   type: string
 *                   nullable: true
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Internal server error
 */
router.get("/users", UserController.getAllUsers);

/**
 * @swagger
 * /api/users/{userId}:
 *   delete:
 *     summary: Delete a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to delete
 *         example: 019ec533-217f-7396-8d14-ec8f632ca8a7
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User deleted successfully
 *                 data:
 *                   type: null
 *                 error:
 *                   type: string
 *                   nullable: true
 *       400:
 *         description: Missing user ID
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.delete("/users/:userId", UserController.deleteUser);

export default router;
