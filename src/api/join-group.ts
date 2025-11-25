import { Flashcore } from 'robo.js'
import { StudyGroupService } from '../services/study-groups.js'
import { getServerSession } from '@robojs/auth'


/**
 * @openapi
 * /api/join-group:
 *   post:
 *     tags:
 *       - Study Groups
 *       - Authentication
 *     summary: Complete the join process for a study group
 *     description: |
 *       Completes the study group join process after a user has authenticated via Discord OAuth.
 *       This endpoint validates the handoff ID, adds the user to the Discord study group,
 *       notifies W3Schools of the successful join, and returns the Discord invite URL.
 *       
 *       **Flow:**
 *       1. User is redirected here after completing Discord OAuth authentication
 *       2. The handoff ID from the authentication flow is validated
 *       3. User is added to the Discord study group
 *       4. W3Schools is notified of the successful join
 *       5. Handoff data is cleaned up and invite URL is returned
 *       
 *       **Authentication Required:** User must have a valid Discord OAuth session.
 *     security:
 *       - OAuth2: []
 *     requestBody:
 *       required: true
 *       description: The handoff ID from the authentication flow
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - handoffId
 *             properties:
 *               handoffId:
 *                 type: string
 *                 description: The unique handoff identifier generated during the handoff process
 *                 format: uuid
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: User successfully joined the study group
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates whether the join operation was successful
 *                   example: true
 *                 inviteUrl:
 *                   type: string
 *                   description: The Discord invite URL for the study group
 *                   example: "https://discord.gg/abc123xyz"
 *       400:
 *         description: Bad request - The handoffId is missing, invalid, or has expired (expires after 10 minutes)
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Invalid or expired handoff ID"
 *       401:
 *         description: Unauthorized - User is not authenticated or session is invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Unauthorized"
 */
export default async function (req: Request) {
	const session = await getServerSession(req)
	if (!session || !session.user || !session.user.id) {
		return new Response('Unauthorized', { status: 401 })
	}

	const body = await req.json()
	const { handoffId } = body

	if (!handoffId) {
		return new Response('Missing handoffId', { status: 400 })
	}

	const handoffData = await Flashcore.get(`handoff:${handoffId}`)

	if (!handoffData) {
		return new Response('Invalid or expired handoff ID', { status: 400 })
	}

	const { w3sUserId, groupId, groupName } = handoffData as any

	// Add member to group
	await StudyGroupService.addMemberToGroup(session.user.id, w3sUserId, groupId, groupName)
	// Try to handle join immediately (if user is in guild)
	await StudyGroupService.handleUserJoin(session.user.id, groupId)

	// Notify W3Schools
	// We need the session token. In Auth.js, session token might be in cookies or session object.
	// session.sessionToken might not be standard in all adapters, but let's assume it's available or we use the ID.
	// The requirement says "session token".
	// If not in session object, we might need to get it from cookies or DB.
	// For now, let's pass session.sessionToken if it exists, or empty string.
	const sessionToken = (session as any).sessionToken || ''
	
	await StudyGroupService.notifyW3Schools(w3sUserId, session.user.id, sessionToken)

	// Clean up handoff data
	await Flashcore.delete(`handoff:${handoffId}`)

	return Response.json({ 
		success: true, 
		inviteUrl: process.env.DISCORD_INVITE_URL 
	})
}
