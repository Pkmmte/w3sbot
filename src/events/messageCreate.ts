export default async (message: any) => {
	try {
		console.log('global events -> messageCreate')
		// console.log(message);
		console.log(message.attachments)
		console.log(message.content.length)
		console.log(message.groupActivityApplication)
		if (
			message.attachments &&
			message.attachments.size === 0 &&
			message.content.length === 0 &&
			message.groupActivityApplication == null
		) {
			console.log('Message is a poll') // Log if all conditions are met
		}
	} catch (error) {
		console.log(error)
	}
}
