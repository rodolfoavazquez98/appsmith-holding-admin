export default {
	/**
   * Merge multiple PDFs and images into a single PDF
   * Returns FilePicker-like object
   * @param {Array} files - Array of files from FilePicker
   * @returns {Object} - { name, type, size, data }
   */
	async mergeFilesToPdf(files) {
		if (!Array.isArray(files) || files.length === 0) {
			throw new Error("No files provided");
		}

		try {
			const pdfDoc = await PDFLib.PDFDocument.create();

			for (const file of files) {
				if (!file?.data || !file?.type) continue;

				if (file.type === "application/pdf") {
					await this._mergePdfFile(pdfDoc, file);
				} else if (file.type.startsWith("image/")) {
					await this._mergeImageFile(pdfDoc, file);
				} else {
					console.warn(`Skipping unsupported file ${file.name} (${file.type})`);
				}
			}

			const pdfBytes = await pdfDoc.save();
			return this._convertBytesToDataUrl(pdfBytes, "merged.pdf", "application/pdf");
		} catch (error) {
			console.error("Error merging files to PDF:", error);
			throw error;
		}
	},

	/** Private: Merge a PDF file into the main PDF document */
	async _mergePdfFile(mainPdfDoc, file) {
		const base64Data = file.data.split(",")[1];
		const pdfBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
		const srcPdf = await PDFLib.PDFDocument.load(pdfBytes);
		const copiedPages = await mainPdfDoc.copyPages(srcPdf, srcPdf.getPageIndices());
		copiedPages.forEach(p => mainPdfDoc.addPage(p));
	},

	/** Private: Merge an image file as a page in the main PDF document */
	async _mergeImageFile(mainPdfDoc, file) {
		const base64Data = file.data.split(",")[1];
		const imgBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

		let image;
		if (file.type.includes("png")) {
			image = await mainPdfDoc.embedPng(imgBytes);
		} else {
			image = await mainPdfDoc.embedJpg(imgBytes);
		}

		const page = mainPdfDoc.addPage([image.width, image.height]);
		page.drawImage(image, {
			x: 0,
			y: 0,
			width: image.width,
			height: image.height,
		});
	},

	/** Private: Convert Uint8Array PDF bytes into FilePicker-like object */
	_convertBytesToDataUrl(pdfBytes, fileName, mimeType) {
		const byteArray = new Uint8Array(pdfBytes);
		let binary = '';
		for (let i = 0; i < byteArray.length; i++) {
			binary += String.fromCharCode(byteArray[i]);
		}
		const base64 = btoa(binary);

		return {
			name: fileName,
			type: mimeType,
			size: pdfBytes.length,
			data: `data:${mimeType};base64,${base64}`,
		};
	}
};
