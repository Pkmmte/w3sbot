import { StudyGroupService } from '../services/study-groups.js'

/**
 * @openapi
 * /api/disband:
 *   post:
 *     tags:
 *       - Study Groups
 *     summary: Disband a study group
 *     description: |
 *       Permanently disbands a Discord study group. This operation removes the group
 *       from the system and cannot be undone. All members will be notified and the
 *       group will be deleted from the database.
 *       
 *       **Authentication Required:** This endpoint requires a valid API key in the
 *       `x-api-key` header matching the `LEARN_TOGETHER_API_KEY` environment variable.
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       description: The study group to disband
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - groupId
 *             properties:
 *               groupId:
 *                 type: string
 *                 description: The unique identifier of the Discord study group to disband
 *                 example: "123456789012345678"
 *     responses:
 *       200:
 *         description: The study group was successfully disbanded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates whether the operation was successful
 *                   example: true
 *       400:
 *         description: Bad request - The request body is missing the required groupId field
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Missing groupId"
 *       401:
 *         description: Unauthorized - Invalid or missing API key
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Unauthorized"
 *       404:
 *         description: Not found - The specified groupId does not exist in the system
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Group not found"
 *       405:
 *         description: Method not allowed - Only POST requests are accepted
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
