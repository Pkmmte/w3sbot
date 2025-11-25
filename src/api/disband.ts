import { StudyGroupService } from '../services/study-groups.js'

/**
 * @openapi
 * /api/disband:
 *   post:
 *     summary: Disband a study group.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               groupId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Group disbanded successfully.
 *       401:
 *         description: Unauthorized.
 *       400:
 *         description: Missing groupId.
 *       404:
 *         description: Group not found.
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
	const { groupId } = body

	if (!groupId) {
		return new Response('Missing groupId', { status: 400 })
	}

	const success = await StudyGroupService.disbandGroup(groupId)

	if (!success) {
		return new Response('Group not found', { status: 404 })
	}

	return Response.json({ success: true })
}
