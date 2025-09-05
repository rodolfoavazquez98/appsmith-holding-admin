export default {
	async createDocument(data) {
		try {
			return await insertDocumentQuery.run(data);
		} catch (e) {
			console.error("Failed to create document", e);
			throw e;
		}
	},

	async fetchDocuments(individualId) {
		try {
			return await getIndividualDocumentsQuery.run({ individual_id: individualId });
		} catch (e) {
			console.error("Failed to fetch documents", e);
			return [];
		}
	},

	async fetchDocumentById(documentId) {
		try {
			const result = await getDocumentQuery.run({ id: documentId });
			return result[0] || null;
		} catch (e) {
			console.error("Failed to fetch document by ID", e);
			return null;
		}
	},

	async updateDocument(documentId, data) {
		try {
			//return await updateIndividualDocumentsQuery.run({ id: documentId, ...data });
		} catch (e) {
			console.error("Failed to update document", e);
			throw e;
		}
	},

	async deleteDocument(documentId) {
		try {
			return await deleteDocumentQuery.run({ id: documentId });
		} catch (e) {
			console.error("Failed to delete document", e);
			throw e;
		}
	},

	async fetchDocumentTypes() {
		try {
			return await getDocumentTypesQuery.run();
		} catch (e) {
			console.error("Failed to fetch document types", e);
			return [];
		}
	}