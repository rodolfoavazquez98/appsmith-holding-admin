export default {
	bucketName:  'individuals',
	objectsCatalog: 'documents', 
	documentTypes: null,

	async init(){
		await this._loadDocumetTypes();
	},



	async addDocument(individualId, files) {
		try {
			if (!Array.isArray(files) || files.length === 0) {
				throw new Error("No files provided");
			}

			// Separate PDFs and images
			const pdfFiles = files.filter(f => f.type === "application/pdf");
			const imageFiles = files.filter(f => f.type.startsWith("image/"));
			const invalidFiles = files.filter(f => !f.type.startsWith("image/") && f.type !== "application/pdf");

			if (invalidFiles.length > 0) {
				throw new Error(`Invalid file types provided: ${invalidFiles.map(f => f.type).join(", ")}`);
			}

			let finalFile;

			if (pdfFiles.length === 1 && imageFiles.length === 0) {
				// Single PDF -> use as is
				finalFile = pdfFiles[0];
			} else if (pdfFiles.length + imageFiles.length > 0) {
				// Merge all PDFs and/or images into one PDF
				finalFile = await PDFService.mergeFilesToPdf([...pdfFiles, ...imageFiles]);
			} else {
				throw new Error("No valid files to process");
			}

			// Build S3/Minio path: individualId/timestamp_filename
			const filePath = `${individualId}/${Date.now()}_${finalFile.name}`;

			// Upload to Minio (finalFile is FilePicker-like object)
			await MinIOStorage.uploadFile(this.bucketName, filePath, finalFile);

			return {
				path: filePath,
				name: finalFile.name,
				type: finalFile.type,
				size: finalFile.size,
			};
		} catch (e) {
			console.error("Failed to add document", e);
			throw e;
		}
	},

	async removeDocument(documentId) {
		const doc = await DocumentRepository.fetchDocumentById(documentId);
		if (!doc) throw new Error("Document not found");

		await MinIOStorage.deleteFile(doc.file_key);
		await DocumentRepository.deleteDocument(documentId);
		return true;
	},

	async updateDocumentInfo(documentId, data) {
		return await DocumentRepository.updateDocument(documentId, data);
	},

	getDocumentTypes() {
		return this.documentTypes || [];
	},

	async _loadDocumetTypes(){
		this.documentTypes = await DocumentRepository.fetchDocumentTypes();
	},

	_generateDocumentPath(individualId, docType, fileName) {
		const unique = Date.now();
		return `${individualId}/${docType}/${unique}_${fileName}`;
	}
}