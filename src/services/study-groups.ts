import { ChannelType, PermissionFlagsBits, VoiceChannel } from 'discord.js'

import { prisma } from '@/core/prisma.js'
import { getClient } from '@robojs/discordjs'

export class StudyGroupService {
	static async createStudyGroup(w3sGroupId: string, name: string) {
		return await prisma.studyGroup.create({
			data: {
				w3sGroupId,
				name
			}
		})
	}

	static async getGroup(w3sGroupId: string) {
		return await prisma.studyGroup.findUnique({
			where: { w3sGroupId },
			include: { members: true }
		})
	}

	static async validateUser() {
		// Check if group exists, if not create it (handled by caller or here? Plan says createStudyGroup is separate)
		// But handoff flow implies we get group ID and name.
		// Let's assume group might not exist yet if this is the first user.

		// let group = await this.getGroup(w3sGroupId)
		
		// If group doesn't exist, we can't really validate against it unless we create it.
		// The handoff flow: 1. API call with user ID, group ID, name.
		// So we should probably ensure group exists when the API is called, or create it then.
		// But the API call is just initiating handoff.
		
		// Let's stick to the plan:
		// 1. API call -> stores pending state.
		// 2. OAuth -> success.
		// 3. Validate user -> This is where we link w3sUserId to our User.
		
		// We need to link the user first.
		// Then add them to the group.
		
		return true
	}

	static async addMemberToGroup(userId: string, w3sUserId: string, w3sGroupId: string, groupName: string) {
		// Ensure group exists
		let group = await this.getGroup(w3sGroupId)
		if (!group) {
			const newGroup = await this.createStudyGroup(w3sGroupId, groupName)
			group = { ...newGroup, members: [] }
		}

		// Check if member already exists
		const existingMember = await prisma.groupMember.findUnique({
			where: {
				groupId_userId: {
					groupId: group.id,
					userId
				}
			}
		})

		if (existingMember) {
			return existingMember
		}

		return await prisma.groupMember.create({
			data: {
				w3sUserId,
				userId,
				groupId: group.id
			}
		})
	}

	static async handleUserJoin(userId: string, w3sGroupId?: string) {
		if (!w3sGroupId) {
			const members = await prisma.groupMember.findMany({
				where: { userId },
				include: { group: true }
			})
			for (const member of members) {
				await this.handleUserJoin(userId, member.group.w3sGroupId)
			}
			return
		}

		const group = await this.getGroup(w3sGroupId)
		if (!group) return

		const account = await prisma.account.findFirst({
			where: { userId, provider: 'discord' }
		})

		if (!account || !account.providerAccountId) {
			console.error('Discord account not found for user', userId)
			return
		}
		const discordUserId = account.providerAccountId

		// Check if channel exists
		let channelId = group.channelId
		const guild = getClient().guilds.cache.get(process.env.DISCORD_GUILD_ID!)
		if (!guild) {
			console.error('Guild not found')
			return
		}

		let channel: VoiceChannel | undefined
		if (channelId) {
			channel = guild.channels.cache.get(channelId) as VoiceChannel
		}

		if (!channel) {
			channel = await this.createVoiceChannel(guild, group.name, [discordUserId])
			await prisma.studyGroup.update({
				where: { id: group!.id },
				data: { channelId: (channel as VoiceChannel).id }
			})
			await this.sendWelcomeMessage(channel as VoiceChannel, discordUserId, true)
		} else {
			// Update permissions for new user
			await channel.permissionOverwrites.edit(discordUserId, {
				ViewChannel: true,
				Connect: true,
				Speak: true
			})
			await this.sendWelcomeMessage(channel, discordUserId, false)
		}
	}

	static async createVoiceChannel(guild: any, name: string, userIds: string[]) {
		const overwrites = [
			{
				id: guild.id,
				deny: [PermissionFlagsBits.ViewChannel]
			},
			{
				id: getClient().user!.id,
				allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.ManageChannels]
			},
			...userIds.map((id) => ({
				id,
				allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak]
			}))
		]

		return await guild.channels.create({
			name: `study-${name}`,
			type: ChannelType.GuildVoice,
			parent: process.env.DISCORD_CATEGORY_ID,
			permissionOverwrites: overwrites
		})
	}

	static async notifyW3Schools(w3sUserId: string, userId: string, sessionToken: string) {
		const webhookUrl = process.env.W3SCHOOLS_WEBHOOK_URL
		if (!webhookUrl) {
			console.warn('W3SCHOOLS_WEBHOOK_URL not set, skipping notification')
			return
		}

		try {
			await fetch(webhookUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-api-key': process.env.LEARN_TOGETHER_API_KEY!
				},
				body: JSON.stringify({
					w3sUserId,
					userId,
					sessionToken
				})
			})
		} catch (error) {
			console.error('Failed to notify W3Schools:', error)
		}
	}

	static async sendWelcomeMessage(channel: VoiceChannel, userId: string, isNewChannel: boolean) {
		// Voice channels can have text now.
		if (isNewChannel) {
			await channel.send({
				content: `Welcome to your new study group, <@${userId}>! 🎓\nThis is a private space for you and your peers to learn together.`,
				components: [] // TODO: Add fancy components
			})
		} else {
			await channel.send({
				content: `Welcome <@${userId}> to the group! 👋`
			})
		}
	}

	static async disbandGroup(w3sGroupId: string) {
		const group = await this.getGroup(w3sGroupId)
		if (!group) return false

		if (group.channelId) {
			const guild = getClient().guilds.cache.get(process.env.DISCORD_GUILD_ID!)
			const channel = guild?.channels.cache.get(group.channelId)
			if (channel) {
				await channel.delete()
			}
		}

		await prisma.studyGroup.delete({
			where: { id: group.id }
		})

		return true
	}
}
