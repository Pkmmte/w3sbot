import { Flashcore } from 'robo.js'

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
