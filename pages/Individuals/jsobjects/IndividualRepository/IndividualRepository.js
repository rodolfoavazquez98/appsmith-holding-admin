export default {
	async fetchIndividualById(individualId) {
		try {
			const result = await getIndividualById.run({ id: individualId });
			return result[0] || null;
		} catch (e) {
			console.error("Failed to fetch individual by ID", e);
			return null;
		}
	}
}