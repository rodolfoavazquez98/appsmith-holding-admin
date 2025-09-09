export default {
	bucketName:  'individuals',
	objectsCatalog: 'documents', 
	documentTypes: [],
	individualDocuments: [],
	loadedDocumentFile: {},

	async init(){
		await this._loadDocumetTypes();
	},

	async addDocument(individualId, documentTypeId, files) {
		try {
			// --- 1. Validate input parameters ---
			if (!individualId) {
				throw new Error("Missing required parameter: individualId");
			}

			if (!documentTypeId) {
				throw new Error("Missing required parameter: documentTypeId");
			}

			if (!Array.isArray(files) || files.length === 0) {
				throw new Error("At least one file must be provided");
			}

			// --- 2. Check if individual exists ---
			const individual = await IndividualRepository.fetchIndividualById(individualId);
			if (!individual) {
				throw new Error(`Individual with id=${individualId} not found`);
			}

			// --- 3. Classify files by type ---
			const pdfFiles = files.filter(f => f.type === "application/pdf");
			const imageFiles = files.filter(f => f.type.startsWith("image/"));
			const invalidFiles = files.filter(
				f => !f.type.startsWith("image/") && f.type !== "application/pdf"
			);

			if (invalidFiles.length > 0) {
				throw new Error(
					`Unsupported file types: ${invalidFiles.map(f => f.type).join(", ")}`
				);
			}

			// --- 4. Determine final file to upload ---
			let finalFile;
			if (pdfFiles.length === 1 && imageFiles.length === 0) {
				finalFile = pdfFiles[0]; // single PDF → no processing needed
			} else {
				finalFile = await PDFService.mergeFilesToPdf([...pdfFiles, ...imageFiles]);
			}

			// --- 5. Resolve document type code ---
			const docType = this.getDocumentTypes().find(dt => dt.id === documentTypeId);
			const documentTypeCode = docType ? docType.code : "other";

			// --- 6. Resolve file extension based on mime-type ---
			const extMap = {
				"application/pdf": ".pdf",
				"image/png": ".png",
				"image/jpeg": ".jpg",
			};
			const ext = extMap[finalFile.type] || "";

			// --- 7. Build MinIO file path ---
			const dir = `${individual.id}/${this.objectsCatalog}/${documentTypeCode}/`;
			const fileName = `${UUID.generate()}${ext}`;
			const filePath = dir + fileName;

			// --- 8. Upload file to MinIO ---
			await MinIOStorage.uploadFile(this.bucketName, filePath, finalFile);

			// --- 9. Save document metadata to DB ---
			await DocumentRepository.createDocument({
				individual_id: individualId,
				document_type_id: documentTypeId,
				file_name: fileName,
				dir: dir,
				mime_type: finalFile.type,
				// uploaded_by: uploadedBy,
				// expiry_date: expiryDate
			});

			// --- 10. Return result object ---
			return {
				filePath,
				fileName,
				mimeType: finalFile.type,
				documentTypeCode,
			};
		} catch (err) {
			console.error("[addDocument] Failed:", err);
			throw err;
		}
	},

	async loadIndividualDocuments(individualId){
		this.individualDocuments = await DocumentRepository.fetchIndividualDocuments(individualId);
	},

	async loadDocumentFile(documentId){
		this.loadedDocumentFile = null;
		const document = this.getIndividualDocuments().find(doc => doc.id === documentId);
		if(document){
			const file = await MinIOStorage.readFile(this.bucketName, document.dir + document.file_name);
			this.loadedDocumentFile ={
				name: document.file_name,
				type: document.mime_type,
				size: file.fileData.length,
				data: `data:${document.mime_type};base64,${file.fileData}`
			}	
		}
	},

	/*async removeDocument(documentId) {
		const doc = await DocumentRepository.fetchDocumentById(documentId);
		if (!doc) throw new Error("Document not found");

		await MinIOStorage.deleteFile(doc.file_key);
		await DocumentRepository.deleteDocument(documentId);
		return true;
	},

	async updateDocumentInfo(documentId, data) {
		return await DocumentRepository.updateDocument(documentId, data);
	},*/

	getLoadedDocument(){
		return this.loadedDocumentFile || null;
	},

	getDocumentTypes() {
		return this.documentTypes || [];
	},

	getIndividualDocuments(){
		return this.individualDocuments || [];
	},

	async _loadDocumetTypes(){
		this.documentTypes = await DocumentRepository.fetchDocumentTypes();
	},
}