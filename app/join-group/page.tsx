'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSessionState } from '../session-context'

export default function JoinGroupPage() {
	const searchParams = useSearchParams()
	const handoffId = searchParams.get('handoffId')
	const { status, session } = useSessionState()
	const router = useRouter()
	const [message, setMessage] = useState('Joining group...')

	useEffect(() => {
		if (status === 'loading') return

		if (status === 'unauthenticated') {
			// Redirect to login with callback
			const callbackUrl = `/join-group?handoffId=${handoffId}`
			router.push(`/api/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`)
			return
		}

		if (status === 'authenticated' && handoffId) {
			// Call API to join
			fetch('/api/join-group', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ handoffId })
			})
				.then((res) => res.json())
				.then((data) => {
					if (data.success && data.inviteUrl) {
						setMessage('Success! Redirecting to Discord...')
						window.location.href = data.inviteUrl
					} else {
						setMessage('Failed to join group. ' + (data.error || ''))
					}
				})
				.catch((err) => {
					setMessage('Error joining group.')
					console.error(err)
				})
		}
	}, [status, handoffId, router])

	if (!handoffId) return <div>Invalid Link</div>

	return (
		<div className="page">
			<section className="hero-card">
				<h1>{message}</h1>
			</section>
		</div>
	)
}
