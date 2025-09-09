export default {
	selectedIndividual: null,

	async selectIndividual(individualId){
		//@todo Add Access Check
		if (!individualId) {
			throw new Error("Missing required parameter: individualId");
		}
		const individual = await IndividualRepository.fetchIndividualById(individualId);
		if (!individual) {
			throw new Error(`Individual with id=${individualId} not found`);
		}
		this.selectedIndividual = individual;

		return individual;
	},

	async getSelectedIndividual(){
		return this.selectedIndividual;
	}
}