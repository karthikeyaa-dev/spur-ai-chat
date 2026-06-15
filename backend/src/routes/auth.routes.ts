import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - confirmPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: Test123!@#
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: Test123!@#
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User registered successfully
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
 *       400:
 *         description: Validation error or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 */
router.post("/register", AuthController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Test123!@#
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Invalid credentials
 */
router.post("/login", AuthController.login);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     description: |
 *       Generates a new access token using a valid refresh token.
 *       The old refresh token is revoked and a new one is issued (token rotation).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refresh_token
 *             properties:
 *               refresh_token:
 *                 type: string
 *                 description: JWT refresh token
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token:
 *                   type: string
 *                 refresh_token:
 *                   type: string
 *                 token_type:
 *                   type: string
 *                   example: bearer
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *       400:
 *         description: Missing refresh token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: refresh_token is required
 *       401:
 *         description: Invalid or expired refresh token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid or expired refresh token
 */
router.post("/refresh", AuthController.refresh);

/**
 * @swagger
 * /api/auth/sessions:
 *   get:
 *     summary: Get all active sessions for a user
 *     tags: [Sessions]
 *     parameters:
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *           format: email
 *         required: true
 *         description: Email of the user to get sessions for
 *         example: user@example.com
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: false
 *         description: User ID (alternative to email)
 *         example: 019ec533-217f-7396-8d14-ec8f632ca8a7
 *     responses:
 *       200:
 *         description: List of active sessions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Active sessions retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       session_id:
 *                         type: string
 *                         example: 550e8400-e29b-41d4-a716-446655440000
 *                       ip_address:
 *                         type: string
 *                         example: 192.168.1.100
 *                       user_agent:
 *                         type: string
 *                         example: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-01-14T10:00:00.000Z
 *                       last_activity:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-01-14T10:05:00.000Z
 *                       expires_at:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-01-21T10:00:00.000Z
 *                 error:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *       400:
 *         description: Missing email or userId parameter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email is required
 *                 data:
 *                   type: null
 *                 error:
 *                   type: string
 *                   example: Missing email
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
 *                   example: Invalid email
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to get sessions
 *                 data:
 *                   type: null
 *                 error:
 *                   type: string
 */
router.get("/sessions", AuthController.getActiveSessions);

/**
 * @swagger
 * /api/auth/sessions/{sessionId}:
 *   delete:
 *     summary: Revoke/terminate a specific session
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The session ID to revoke
 *         example: 055e9280-a0c0-4477-8948-3106235ddde5
 *     responses:
 *       200:
 *         description: Session revoked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Session revoked successfully
 *                 data:
 *                   type: null
 *                 error:
 *                   type: string
 *                   nullable: true
 *       400:
 *         description: Missing session ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Session ID is required
 *                 data:
 *                   type: null
 *                 error:
 *                   type: string
 *       404:
 *         description: Session not found or already revoked
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Session not found or already revoked
 *                 data:
 *                   type: null
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 */
router.delete("/sessions/:sessionId", AuthController.revokeSession);

/**
 * @swagger
 * /api/auth/sessions:
 *   delete:
 *     summary: Revoke all sessions for a user
 *     tags: [Sessions]
 *     parameters:
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *           format: email
 *         description: Email of the user (either email or userId is required)
 *         example: user@example.com
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: User ID (either email or userId is required)
 *         example: 019ec533-217f-7396-8d14-ec8f632ca8a7
 *       - in: header
 *         name: X-Session-Id
 *         schema:
 *           type: string
 *         required: false
 *         description: Current session ID to exclude from revocation (keeps current session active)
 *         example: 055e9280-a0c0-4477-8948-3106235ddde5
 *     responses:
 *       200:
 *         description: All sessions revoked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 3 session(s) revoked successfully
 *                 data:
 *                   type: null
 *                 error:
 *                   type: string
 *                   nullable: true
 *       400:
 *         description: Missing email or userId
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Either email or userId is required
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
router.delete("/sessions", AuthController.revokeAllSessions);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout current session
 *     tags: [Sessions]
 *     parameters:
 *       - in: query
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The current session ID to logout
 *         example: 055e9280-a0c0-4477-8948-3106235ddde5
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logged out successfully
 *                 data:
 *                   type: null
 *                 error:
 *                   type: string
 *                   nullable: true
 *       400:
 *         description: Missing session ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Session ID is required
 *                 data:
 *                   type: null
 *                 error:
 *                   type: string
 *       404:
 *         description: Session not found or already logged out
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Session not found or already logged out
 *                 data:
 *                   type: null
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 */
router.post("/logout", AuthController.logout);

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication endpoints
 *   - name: Email Verification
 *     description: Email verification endpoints
 */

/**
 * @swagger
 * /api/auth/verify-email:
 *   get:
 *     summary: Verify user email address
 *     description: |
 *       Verify a user's email address using the token sent via email.
 *       This endpoint is typically accessed by clicking the link in the verification email.
 *     tags: [Email Verification]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Email verification token sent to user's email
 *         example: "a7f3e8b9c2d4f6a1b3c5e7g9h2j4k6l8"
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email verified successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 019ec533-217f-7396-8d14-ec8f632ca8a7
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *                     email_verified_at:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-01-15T10:00:00.000Z
 *                 error:
 *                   type: string
 *                   nullable: true
 *       302:
 *         description: Redirect to frontend success/error page (for browser requests)
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *             description: Redirect URL
 *       400:
 *         description: Missing token parameter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Verification token is required
 *                 data:
 *                   type: null
 *                 error:
 *                   type: string
 *                   example: Missing token parameter
 *       404:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid or expired verification token
 *                 data:
 *                   type: null
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 */
router.get("/verify-email", AuthController.verifyEmail);

/**
 * @swagger
 * /api/auth/verify-email/resend:
 *   post:
 *     summary: Resend verification email
 *     description: Resend the email verification link to the authenticated user's email address
 *     tags: [Email Verification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Verification email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Verification email sent successfully
 *                 data:
 *                   type: null
 *                 error:
 *                   type: string
 *                   nullable: true
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *                 data:
 *                   type: null
 *                 error:
 *                   type: string
 *       400:
 *         description: Email already verified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email already verified
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
router.post("/verify-email/resend", AuthController.resendVerificationEmail);

/**
 * @swagger
 * /api/auth/email-verified:
 *   get:
 *     summary: Check email verification status
 *     description: Get the email verification status of the authenticated user
 *     tags: [Email Verification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Email verification status retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email verification status retrieved
 *                 data:
 *                   type: object
 *                   properties:
 *                     verified:
 *                       type: boolean
 *                       description: Whether the email is verified
 *                       example: true
 *                     email:
 *                       type: string
 *                       format: email
 *                       description: User's email address
 *                       example: user@example.com
 *                     email_verified_at:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                       description: Timestamp when email was verified
 *                       example: 2026-01-15T10:00:00.000Z
 *                 error:
 *                   type: string
 *                   nullable: true
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
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
router.get("/email-verified", AuthController.checkEmailVerified);

export default router;
