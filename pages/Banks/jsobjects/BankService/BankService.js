export default {
	banks: [],
	correspondentAccounts: [],
	selectedBank: null,

	async init(){
		await this.fetchBanks();
	},

	async fetchBanks(params = {}){
		try {
			const defaultParams = {
				searchText: '',
				sortColumn: 'id',
				sortOrder: 'ASC',
				pageSize: (typeof Banks_Table !== 'undefined' && Banks_Table.pageSize) ? Banks_Table.pageSize : 20,
				pageNo: 1
			};
			const queryParams = { ...defaultParams, ...params };
			await getBanksQuery.run(queryParams);

			this.banks = Array.isArray(getBanksQuery.data) ? getBanksQuery.data : [];

			return this.banks;
		} catch(error){
			this.handleError('Fetching banks', error);
			return [];
		}
	},

	getBanks(){
		return this.banks;
	},

	setSelectedBank(bank){
		this.selectedBank = bank || null;
	},

	getSelectedBank(){
		return this.selectedBank;
	},

	async deleteBank(bankId){
		if(!bankId) {
			this.handleError('Deleting bank', new Error('Bank ID is required'));
			return;
		}

		try {
			await deleteBankQuery.run({ id: bankId});
			this.banks = this.banks.filter(b => b.id !== bankId);
		}catch(error){
			console.error(error);
			this.handleError('Deleting bank', error);
		}
	},

	async fetchCorrespondentAccounts(bankId){
		if(!bankId) {
			this.handleError('Fetching correspondent accounts', new Error('Bank ID is required'));
			return [];
		}

		try {
			await getCorrAccountsQuery.run({bankId});
			this.correspondentAccounts = getCorrAccountsQuery.data || [];
			return this.correspondentAccounts;
		} catch (error){
			this.handleError('Fetching correspondent accounts', error);
			return [];
		}
	},

	getCorrespondentAccounts(){
		return this.correspondentAccounts;
	},

	async addCorrespondentAccount(corrAccount){
		try {
			const { bankId, currencyId, account, bankCorrespondentId } = corrAccount;
			const newCorrespondentAccount = await insertCorrAccountQuery.run({ bankId, currencyId, account, bankCorrespondentId });

			await this.fetchCorrespondentAccounts(bankId);

			showAlert('Correspondent account added!', 'success');
			return newCorrespondentAccount;
		} catch(error){
			this.handleError('Creating correspondent account', error);
			return null;
		}
	},

	async deleteCorrespondentAccount(accountId){
		if(!accountId) {
			console.error("Account Id is required");
			return;
		}
		try {
			await deleteCorrAccountQuery.run({ id: accountId});
			this.correspondentAccounts = this.correspondentAccounts.filter(acc => acc.id !== accountId);

		}catch(error){
			this.handleError('Deleting correpondent account', error);
		}
	},

	async fetchCurrencies(){
		try {
			const currencies = await getCurrenciesQuery.run();
			return currencies.map(c => ({
				label: c.currency_code,
				value: c.id
			}));
		} catch(error){
			console.error(error);
			this.handleError("Fetching currencies", error);
			return [];
		}
	},

	handleError(action, error) {
		console.error(`Error in ${action}:`, error);
		showAlert(`${action} failed: ${error.message || error}`, 'error');
	}
}