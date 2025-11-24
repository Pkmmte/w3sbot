export default async function (data) {
	const [interaction] = data.payload
	const { key, module, type } = data.record

	if (interaction && type === 'event' && key === 'messageCreate' && data.record) {
		interaction['record'] = data.record
	}
}
