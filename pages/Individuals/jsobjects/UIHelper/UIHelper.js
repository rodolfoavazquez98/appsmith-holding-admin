export default {
  deleteContext: {
    entityId: null,
    entityName: null,
    deleteAction: null, // хранит функцию удаления (async)
  },

  isDeleting: false,

  /**
   * Open delete modal with a promise-based delete action
   */
  openDeleteModal(entityId, entityName, deleteAction) {
    if (typeof deleteAction !== "function") {
      throw new Error("deleteAction must be a function that returns a Promise");
    }

    this.deleteContext = {
      entityId,
      entityName,
      deleteAction
    };

    showModal(Delete_Confirmation_Modal.name);
  },

  /**
   * Confirm delete
   */
  async confirmDelete() {
    const { entityName, deleteAction } = this.deleteContext;

    if (!deleteAction) {
      throw new Error("Delete action not set");
    }

    this.isDeleting = true;

    try {
      // ВАЖНО: тут мы вызываем именно async функцию удаления
      await deleteAction();

      const message = `${entityName} successfully deleted`;

      this.closeDeleteModal();

      return { success: true, message };
    } catch (error) {
      console.error("Deletion error:", error);
      return { success: false, message: "Deletion failed. Check logs or contact admin." };
    } finally {
      this.isDeleting = false;
    }
  },

  /**
   * Close modal and reset context
   */
  closeDeleteModal() {
    this.deleteContext = {
      entityId: null,
      entityName: null,
      deleteAction: null
    };
    this.isDeleting = false;
    closeModal(Delete_Confirmation_Modal.name);
  }
};