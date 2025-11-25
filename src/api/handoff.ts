import { Flashcore } from 'robo.js'
import crypto from 'node:crypto'

/**
 * @openapi
 * /api/handoff:
 *   post:
 *     tags:
 *       - Study Groups
 *       - Authentication
 *     summary: Initiate the handoff process for a user joining a study group
 *     description: |
 *       Creates a secure handoff session for a W3Schools user to join a Discord study group.
 *       This endpoint generates a unique handoff ID that is stored temporarily (10 minutes)
 *       and returns a redirect URL that initiates the OAuth authentication flow.
 *       
 *       **Flow:**
 *       1. W3Schools calls this endpoint with user and group information
 *       2. A handoff ID is generated and stored with the provided data
 *       3. A redirect URL is returned that points to the authentication start endpoint
 *       4. The user is redirected to Discord OAuth, then back to complete the join process
 *       
 *       **Authentication Required:** This endpoint requires a valid API key in the
 *       `x-api-key` header matching the `LEARN_TOGETHER_API_KEY` environment variable.
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       description: User and group information for the handoff process
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - w3sUserId
 *               - groupId
 *               - groupName
 *             properties:
 *               w3sUserId:
 *                 type: string
 *                 description: The unique identifier of the W3Schools user who wants to join the group
 *                 example: "w3s_user_12345"
 *               groupId:
 *                 type: string
 *                 description: The unique identifier of the Discord study group to join
 *                 example: "123456789012345678"
 *               groupName:
 *                 type: string
 *                 description: The display name of the study group
 *                 example: "JavaScript Study Group"
 *     responses:
 *       200:
 *         description: Handoff session created successfully. Returns the redirect URL for OAuth flow.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 redirectUrl:
 *                   type: string
 *                   description: The URL to redirect the user to for Discord OAuth authentication
 *                   example: "http://localhost:3000/api/auth-start?handoffId=550e8400-e29b-41d4-a716-446655440000"
 *       400:
 *         description: Bad request - One or more required fields (w3sUserId, groupId, groupName) are missing
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Missing required fields"
 *       401:
 *         description: Unauthorized - Invalid or missing API key
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Unauthorized"
 *       405:
 *         description: Method not allowed - Only POST requests are accepted
 *       500:
 *         description: Internal server error - Failed to generate the OAuth redirect URL
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Failed to generate OAuth URL"
 */
export default async function (req: Request) {
	if (req.method !== 'POST') {
		return new Response('Method Not Allowed', { status: 405 })
	}

	const apiKey = req.headers.get('x-api-key')
	if (apiKey !== process.env.LEARN_TOGETHER_API_KEY) {
		return new Response('Unauthorized', { status: 401 })
	}

	const body = await req.json()
	const { w3sUserId, groupId, groupName } = body

	if (!w3sUserId || !groupId || !groupName) {
		return new Response('Missing required fields', { status: 400 })
	}

	const handoffId = crypto.randomUUID()
	// Store handoff data for 10 minutes
	await Flashcore.set(`handoff:${handoffId}`, { w3sUserId, groupId, groupName })

	const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
	const redirectUrl = `${baseUrl}/api/auth-start?handoffId=${handoffId}`

	return Response.json({ redirectUrl })
}
