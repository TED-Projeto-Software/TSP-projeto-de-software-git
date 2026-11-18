
const dialog = document.querySelector("#task-dialog");
const form = document.querySelector("#task-form");

export function openModal(task = null) {
    form.reset();

    document.querySelector("#task-id").value = task?.id || "";
    document.querySelector("#task-title").value = task?.title || "";
    document.querySelector("#task-description").value = task?.description || "";
    document.querySelector("#task-priority").value = task?.priority || "medium";
    document.querySelector("#task-status").value = task?.status || "pending";

    document.querySelector("#dialog-title").textContent =
        task ? "Editar tarefa" : "Nova tarefa";

    dialog.showModal();
}

export function closeModal() {
    dialog.close();
}
