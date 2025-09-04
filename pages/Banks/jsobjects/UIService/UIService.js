export default {
	deleteContext: {
		entityId: null,
		entityName: null
	},

	isDeleting: false,

	deleteCallback: null,

	afterDeleteCallback: null,

	openDeleteModal(entityId, entityName, deleteCallback, refreshCallback) {
		this.deleteContext = {
			entityId: entityId,
			entityName: entityName
		};
		this.deleteCallback = deleteCallback;
		this.afterDeleteCallback = refreshCallback || null;
		showModal(Delete_Confirmation_Modal.name);
	},

	async confirmDelete() {

		if (!this.deleteCallback || typeof this.deleteCallback !== "function") {
			showAlert(`Delete callback not provided or invalid`, "error");
			return;
		}

		this.isDeleting = true;

		try {

			this.deleteCallback();
			showAlert(`${this.deleteContext.entityName} successfully deleted`, "success");

			if (this.afterDeleteCallback && typeof this.afterDeleteCallback !== "function") {
				this.afterDeleteCallback();
			}

			this.closeDeleteModal();
		} catch (error) {
			console.error("Deletion error:", error);
			showAlert("Deletion failed. Check logs or contact admin.", "error");
		} finally {
			this.isDeleting = false;
		}
	},

	closeDeleteModal() {
		this.deleteContext = {
			entityId: null,
			entityName: null,
		};
		this.isDeleting = false;
		this.deleteCallback = null;
		this.afterDeleteCallback = null;
		closeModal(Delete_Confirmation_Modal.name);
	}
}
