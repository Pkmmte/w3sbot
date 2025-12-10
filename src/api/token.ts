/**
 * Token exchange endpoint for Discord Activities OAuth flow.
 * Exchanges an authorization code for an access token.
 */
export default async function (req: Request) {
	if (req.method !== 'POST') {
		return new Response('Method Not Allowed', { status: 405 })
	}

	try {
		const body = await req.json()
		const { code } = body

		if (!code) {
			return Response.json({ error: 'Missing authorization code' }, { status: 400 })
		}

		// Exchange the code for an access token
		const response = await fetch('https://discord.com/api/oauth2/token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams({
				client_id: process.env.DISCORD_CLIENT_ID!,
				client_secret: process.env.DISCORD_CLIENT_SECRET!,
				grant_type: 'authorization_code',
				code,
			}),
		})

		if (!response.ok) {
			const error = await response.text()
			console.error('Discord token exchange failed:', error)
			return Response.json({ error: 'Token exchange failed' }, { status: response.status })
		}

		const data = await response.json()

		return Response.json({ access_token: data.access_token })
	} catch (error) {
		console.error('Token endpoint error:', error)
		return Response.json({ error: 'Internal server error' }, { status: 500 })
	}
}
