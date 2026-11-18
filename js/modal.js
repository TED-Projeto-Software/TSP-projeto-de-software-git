
const dialog = document.querySelector("#task-dialog");
const form = document.querySelector("#task-form");
const titleInput = document.querySelector("#task-title");

export function openModal(task = null) {
    form.reset();

    document.querySelector("#task-id").value = task?.id || "";

    titleInput.value = task?.title || "";

    document.querySelector("#task-description").value =
        task?.description || "";

    document.querySelector("#task-priority").value =
        task?.priority || "medium";

    document.querySelector("#task-status").value =
        task?.status || "pending";

    document.querySelector("#dialog-title").textContent =
        task ? "Editar tarefa" : "Nova tarefa";

    if (!dialog.open) {
        dialog.showModal();
    }

    requestAnimationFrame(() => {
        titleInput.focus();
    });
}

export function closeModal() {
    if (dialog.open) {
        dialog.close();
    }
}
