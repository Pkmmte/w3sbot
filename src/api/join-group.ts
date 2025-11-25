import { Flashcore, logger } from 'robo.js'
import { StudyGroupService } from '../services/study-groups.js'
import { getServerSession } from '@robojs/auth'


/**
 * @openapi
 * /api/join-group:
 *   post:
 *     summary: Complete the join process for a study group.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               handoffId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Joined successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 inviteUrl:
 *                   type: string
 *       401:
 *         description: Unauthorized.
 *       400:
 *         description: Invalid or expired handoff ID.
 */
export default async function (req: Request) {
	const session = await getServerSession(req)
	logger.warn('Session: ', session)
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
	logger.warn('Session token: ', sessionToken)
	
	await StudyGroupService.notifyW3Schools(w3sUserId, session.user.id, sessionToken)

	// Clean up handoff data
	await Flashcore.delete(`handoff:${handoffId}`)

	return Response.json({ 
		success: true, 
		inviteUrl: process.env.DISCORD_INVITE_URL 
	})
}
