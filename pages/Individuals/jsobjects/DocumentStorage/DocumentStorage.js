export default {
	async uploadFile(file, key) {
		try {
			return await uploadFileToMinioQuery.run({ file, key });
		} catch (e) {
			console.error("Failed to upload file", e);
			throw e;
		}
	},

	async getSignedUrl(key) {
		try {
			return await getSignedUrlQuery.run({ key });
		} catch (e) {
			console.error("Failed to get signed URL", e);
			return null;
		}
	},

	async deleteFile(key) {
		try {
			return await deleteFileFromMinioQuery.run({ key });
		} catch (e) {
			console.error("Failed to delete file", e);
			throw e;
		}
	}
}