import { StudyGroupService } from '../services/study-groups.js'
import { GuildMember } from 'discord.js'

export default async (member: GuildMember) => {
	await StudyGroupService.handleUserJoin(member.id)
}
