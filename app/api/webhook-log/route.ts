import { NextResponse } from 'next/server'

export async function POST(request: Request) {
	try {
		const body = await request.json()
		const headers: Record<string, string> = {}
		
		// Extract all headers
		request.headers.forEach((value, key) => {
			headers[key] = value
		})

		const logEntry = {
			timestamp: new Date().toISOString(),
			method: 'POST',
			headers,
			body,
			url: request.url
		}

		// Log to console with clear formatting
		console.log('='.repeat(80))
		console.log('W3SCHOOLS WEBHOOK CALL RECEIVED')
		console.log('='.repeat(80))
		console.log('Timestamp:', logEntry.timestamp)
		console.log('Headers:', JSON.stringify(headers, null, 2))
		console.log('Body:', JSON.stringify(body, null, 2))
		console.log('='.repeat(80))

		// Return success response
		return NextResponse.json({
			success: true,
			message: 'Webhook call logged successfully',
			received: logEntry
		}, { status: 200 })
	} catch (error) {
		console.error('Error logging webhook call:', error)
		return NextResponse.json(
			{ 
				success: false, 
				error: 'Invalid request format',
				details: error instanceof Error ? error.message : 'Unknown error'
			}, 
			{ status: 400 }
		)
	}
}

