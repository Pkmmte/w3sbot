import { Flashcore } from 'robo.js'
import crypto from 'node:crypto'

/**
 * @openapi
 * /api/handoff:
 *   post:
 *     summary: Initiate the handoff process for a user joining a study group.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               w3sUserId:
 *                 type: string
 *               groupId:
 *                 type: string
 *               groupName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Handoff initiated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 redirectUrl:
 *                   type: string
 *       401:
 *         description: Unauthorized.
 *       400:
 *         description: Missing required fields.
 *       500:
 *         description: Failed to generate OAuth URL.
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
