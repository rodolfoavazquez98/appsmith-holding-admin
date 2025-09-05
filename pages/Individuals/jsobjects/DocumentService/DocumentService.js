export default {
	async addDocument(individualId, file, documentTypeId, uploadedBy, expiryDate = null) {
		try {
			const fileKey = `${individualId}/${Date.now()}_${file.name}`;
			await DocumentStorage.uploadFile(file, fileKey);
			
			
			return await DocumentRepository.createDocument({
				individual_id: individualId,
				document_type_id: documentTypeId,
				file_name: file.name,
				file_key: fileKey,
				mime_type: file.type,
				uploaded_by: uploadedBy,
				expiry_date: expiryDate
			});
		} catch (e) {
			console.error("Failed to add document", e);
			throw e;
		}
	},

	async getDocuments(individualId) {
		const documents = await DocumentRepository.fetchDocuments(individualId);

		// добавить signedUrl и creator_name
		return await Promise.all(
			documents.map(async doc => {
				const signedUrl = await DocumentStorage.getSignedUrl(doc.file_key);
				return {
					...doc,
					creator_name: doc.creator_name || "Unknown",
					signed_url: signedUrl
				};
			})
		);
	},

	async removeDocument(documentId) {
		const doc = await DocumentRepository.fetchDocumentById(documentId);
		if (!doc) throw new Error("Document not found");

		await DocumentStorage.deleteFile(doc.file_key);
		await DocumentRepository.deleteDocument(documentId);
		return true;
	},

	async updateDocumentInfo(documentId, data) {
		return await DocumentRepository.updateDocument(documentId, data);
	},

	async getDocumentTypes() {
		return await DocumentRepository.fetchDocumentTypes();
	}
}