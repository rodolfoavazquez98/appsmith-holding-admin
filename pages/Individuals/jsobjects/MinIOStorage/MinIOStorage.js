export default {
	async uploadFile(bucket, path, file) {
		try {
			return await uploadFile.run({bucket, path, data: file});
		} catch (e) {
			console.error("Failed to upload file", e);
			throw e;
		}
	},

	async listFiles(bucket, pathPrefix = ""){
		try {
			return await listFiles.run({bucket, prefix: pathPrefix});
		} catch (e) {
			console.error("Failed to get signed URL", e);
			return null;
		}
	},

	async deleteFile(bucket, path) {
		try {
			return await deleteFile.run({ bucket, path });
		} catch (e) {
			console.error("Failed to delete file", e);
			throw e;
		}
	}
}