import { Cron } from '@robojs/cron'
import { env } from '../../core/env.js'

export default async () => {
	const schedule = env.get('reputation.reminderCronSchedule')
	Cron(schedule, 'cron/reputation-reminder.js').resume()
}
