import { Flashcore } from 'robo.js'

/**
 * @openapi
 * /api/auth-start:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Start the Discord OAuth authentication flow
 *     description: |
 *       Initiates the Discord OAuth authentication process for a user joining a study group.
 *       This endpoint is called with a handoff ID that was created during the handoff process.
 *       
 *       **Flow:**
 *       1. Validates the handoff ID from the query parameter
 *       2. Retrieves stored handoff data (w3sUserId, groupId, groupName)
 *       3. Fetches CSRF token from Auth.js
 *       4. Initiates Discord OAuth sign-in flow
 *       5. Redirects user to Discord for authentication
 *       
 *       **Note:** This is an internal endpoint used as part of the OAuth flow and should
 *       not be called directly by external clients.
 *     parameters:
 *       - in: query
 *         name: handoffId
 *         required: true
 *         description: The unique handoff identifier from the handoff process
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       302:
 *         description: Redirects to Discord OAuth authentication page
 *         headers:
 *           Location:
 *             description: The Discord OAuth authorization URL
 *             schema:
 *               type: string
 *               example: "https://discord.com/oauth2/authorize?..."
 *           Set-Cookie:
 *             description: Authentication cookies for the OAuth flow
 *             schema:
 *               type: string
 *       400:
 *         description: Bad request - Missing or invalid handoffId
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Missing handoffId"
 *       500:
 *         description: Internal server error - Failed to get redirect URL from Auth.js
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Failed to get redirect URL from Auth.js"
 */
export default async function (req: Request) {
	const url = new URL(req.url)
	const handoffId = url.searchParams.get('handoffId')

	if (!handoffId) {
		return new Response('Missing handoffId', { status: 400 })
	}

	const handoffData = await Flashcore.get(`handoff:${handoffId}`)
	if (!handoffData) {
		return new Response('Invalid or expired handoff ID', { status: 400 })
	}

	const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
	const callbackUrl = `${baseUrl}/join-group?handoffId=${handoffId}`

	// 1. Fetch CSRF Token AND capture the 'Set-Cookie' header
	const csrfRes = await fetch(`${baseUrl}/api/auth/csrf`)
	const { csrfToken } = await csrfRes.json()

	// Capture cookies set by the CSRF endpoint
	// @ts-ignore - getSetCookie is available in Node 18+
	const csrfCookies = csrfRes.headers.getSetCookie?.() ?? csrfRes.headers.get('set-cookie') ?? []
	const csrfCookieString = Array.isArray(csrfCookies) ? csrfCookies.join('; ') : csrfCookies

	// 2. POST to Signin using the captured cookie
	const signinRes = await fetch(`${baseUrl}/api/auth/signin/discord`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Cookie': csrfCookieString
		},
		body: JSON.stringify({
			csrfToken,
			callbackUrl,
			json: true,
			redirect: false
		}),
		redirect: 'manual'
	})

	let redirectUrl: string | null = null

	if (signinRes.status >= 300 && signinRes.status < 400) {
		redirectUrl = signinRes.headers.get('location')
	} else {
		try {
			const data = await signinRes.json()
			redirectUrl = data.url
		} catch (e) {
			console.error('Failed to parse JSON from signin response')
		}
	}

	if (!redirectUrl) {
		return new Response('Failed to get redirect URL from Auth.js', { status: 500 })
	}

	// Capture cookies set by the Signin endpoint (PKCE, State, etc.)
	// @ts-ignore - getSetCookie is available in Node 18+
	const signinCookies = signinRes.headers.getSetCookie?.() ?? signinRes.headers.get('set-cookie') ?? []

	// 3. Prepare the response to the user's browser
	// We forward ALL cookies (CSRF + PKCE/State) and redirect the user to Discord
	const response = new Response(null, {
		status: 302,
		headers: {
			Location: redirectUrl
		}
	})

	// Append all cookies to the response
	const allCookies = [
		...(Array.isArray(csrfCookies) ? csrfCookies : [csrfCookies]),
		...(Array.isArray(signinCookies) ? signinCookies : [signinCookies])
	].filter(Boolean)

	allCookies.forEach((cookie) => {
		response.headers.append('Set-Cookie', cookie)
	})

	return response
}
