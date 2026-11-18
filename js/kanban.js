
import { escapeHTML } from "./utils.js";

const columns = [
    { status: "pending", title: "A fazer", icon: "♡" },
    { status: "progress", title: "Em andamento", icon: "✿" },
    { status: "completed", title: "Concluídas", icon: "✓" }
];

const statusOrder = ["pending", "progress", "completed"];

function formatDate(date) {
    if (!date) return "";

    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
}

export function renderKanban(tasks = []) {
    const board = document.querySelector("#kanban-board");
    if (!board) return;

    board.innerHTML = columns.map(column => {
        const columnTasks = tasks.filter(
            task => task.status === column.status
        );

        return `
            <section class="kanban-column kanban-${column.status}">
                <header class="kanban-column-heading">
                    <h3>
                        <span>${column.icon}</span>
                        ${column.title}
                    </h3>
                    <span class="kanban-count">${columnTasks.length}</span>
                </header>

                <div class="kanban-card-list">
                    ${columnTasks.length ? columnTasks.map(task => {
                        const currentIndex = statusOrder.indexOf(task.status);

                        return `
                            <article class="kanban-card">
                                <h4>${escapeHTML(task.title)}</h4>

                                <p>${escapeHTML(
                                    task.description || "Sem descrição."
                                )}</p>

                                <div class="kanban-card-meta">
                                    <span class="kanban-priority priority-${escapeHTML(task.priority || "medium")}">
                                        ${task.priority === "high" ? "Alta" :
                                          task.priority === "low" ? "Baixa" : "Média"}
                                    </span>

                                    ${task.dueDate
                                        ? `<span>Prazo: ${formatDate(task.dueDate)}</span>`
                                        : ""}
                                </div>

                                <div class="kanban-card-actions">
                                    <button
                                        type="button"
                                        data-kanban-move="${statusOrder[currentIndex - 1] || ""}"
                                        data-task-id="${escapeHTML(task.id)}"
                                        ${currentIndex === 0 ? "disabled" : ""}
                                        aria-label="Mover ${escapeHTML(task.title)} para a coluna anterior"
                                    >←</button>

                                    <button
                                        type="button"
                                        data-kanban-move="${statusOrder[currentIndex + 1] || ""}"
                                        data-task-id="${escapeHTML(task.id)}"
                                        ${currentIndex === 2 ? "disabled" : ""}
                                        aria-label="Mover ${escapeHTML(task.title)} para a próxima coluna"
                                    >→</button>
                                </div>
                            </article>
                        `;
                    }).join("") : `
                        <p class="kanban-empty">Nenhuma tarefa por aqui. ♡</p>
                    `}
                </div>
            </section>
        `;
    }).join("");
}

export function initializeKanban() {
    const board = document.querySelector("#kanban-board");
    if (!board) return;

    board.addEventListener("click", event => {
        const button = event.target.closest("[data-kanban-move]");
        if (!button || button.disabled) return;

        document.dispatchEvent(new CustomEvent("devcafe:kanban-move", {
            detail: {
                id: button.dataset.taskId,
                status: button.dataset.kanbanMove
            }
        }));
    });
}

