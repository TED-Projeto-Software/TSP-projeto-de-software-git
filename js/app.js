
import { loadTasks, saveTasks } from "./storage.js";

import {
    createTask,
    updateTask,
    deleteTask,
    filterTasks
} from "./tasks.js";

import { openModal, closeModal } from "./modal.js";
import { showNotification } from "./notifications.js";
import { escapeHTML, formatDate } from "./utils.js";

let tasks = loadTasks();
let currentFilter = "all";

const taskList = document.querySelector("#task-list");
const taskForm = document.querySelector("#task-form");
const searchInput = document.querySelector("#search-input");

const statusLabels = {
    pending: "Pendente",
    progress: "Em andamento",
    completed: "Concluída"
};

const priorityLabels = {
    low: "Baixa",
    medium: "Média",
    high: "Alta"
};

const priorityClasses = {
    low: "priority-low",
    medium: "priority-medium",
    high: "priority-high"
};

function persistTasks() {
    saveTasks(tasks);
}

function updateSummary() {
    document.querySelector("#total-tasks").textContent = tasks.length;

    document.querySelector("#pending-tasks").textContent =
        tasks.filter((task) => task.status === "pending").length;

    document.querySelector("#progress-tasks").textContent =
        tasks.filter((task) => task.status === "progress").length;

    document.querySelector("#completed-tasks").textContent =
        tasks.filter((task) => task.status === "completed").length;
}

function renderEmptyState() {
    taskList.innerHTML = `
        <div class="empty-state">
            <span>🌷</span>
            <h3>Nenhuma tarefa por aqui!</h3>
            <p>Que tal adicionar uma nova tarefa?</p>
        </div>
    `;
}

function renderTasks() {
    const visibleTasks = filterTasks(
        tasks,
        currentFilter,
        searchInput.value
    );

    updateSummary();

    if (visibleTasks.length === 0) {
        renderEmptyState();
        return;
    }

    taskList.innerHTML = visibleTasks.map((task) => `
        <article class="task-card" data-id="${escapeHTML(task.id)}">
            <div class="task-info">
                <h3>${escapeHTML(task.title)}</h3>
                <p>${escapeHTML(task.description || "Sem descrição.")}</p>

                <div class="task-meta">
                    <span class="priority ${priorityClasses[task.priority]}">
                        Prioridade ${priorityLabels[task.priority]}
                    </span>
                    <span class="status">
                        ${statusLabels[task.status]}
                    </span>
                    <span class="status">
                        Criada em ${formatDate(new Date(task.createdAt))}
                    </span>
                </div>
            </div>

            <div class="task-actions">
                <select class="status-select" data-action="status"
                    aria-label="Alterar status da tarefa">
                    <option value="pending" ${task.status === "pending" ? "selected" : ""}>Pendente</option>
                    <option value="progress" ${task.status === "progress" ? "selected" : ""}>Em andamento</option>
                    <option value="completed" ${task.status === "completed" ? "selected" : ""}>Concluída</option>
                </select>

                <button type="button" data-action="edit">Editar</button>
                <button type="button" data-action="delete">Excluir</button>
            </div>
        </article>
    `).join("");
}

function handleTaskSubmit(event) {
    event.preventDefault();

    const id = document.querySelector("#task-id").value;

    const data = {
        title: document.querySelector("#task-title").value,
        description: document.querySelector("#task-description").value,
        priority: document.querySelector("#task-priority").value,
        status: document.querySelector("#task-status").value
    };

    if (!data.title.trim()) {
        showNotification("Digite um nome para a tarefa.");
        return;
    }

    if (id) {
        tasks = updateTask(tasks, id, data);
        showNotification("Tarefa atualizada com carinho! 🌷");
    } else {
        tasks.push(createTask(data));
        showNotification("Nova tarefa adicionada! ✨");
    }

    persistTasks();
    renderTasks();
    closeModal();
}

function handleTaskAction(event) {
    const control = event.target.closest("[data-action]");
    if (!control) return;

    const card = control.closest(".task-card");
    const id = card.dataset.id;
    const action = control.dataset.action;

    const task = tasks.find((item) => item.id === id);
    if (!task) return;

    if (action === "edit") {
        openModal(task);
    }

    if (action === "delete") {
        const confirmed = window.confirm(
            `Deseja realmente excluir "${task.title}"?`
        );

        if (!confirmed) return;

        tasks = deleteTask(tasks, id);
        persistTasks();
        renderTasks();
        showNotification("Tarefa excluída.");
    }

    if (action === "status") {
        tasks = updateTask(tasks, id, {
            status: control.value
        });

        persistTasks();
        renderTasks();
        showNotification("Status atualizado! ♡");
    }
}

function initializeEvents() {
    document.querySelector("#add-task-btn")
        .addEventListener("click", () => openModal());

    document.querySelector("#close-dialog-btn")
        .addEventListener("click", closeModal);

    document.querySelector("#cancel-dialog-btn")
        .addEventListener("click", closeModal);

    taskForm.addEventListener("submit", handleTaskSubmit);
    taskList.addEventListener("click", handleTaskAction);
    taskList.addEventListener("change", handleTaskAction);

    searchInput.addEventListener("input", renderTasks);

    document.querySelectorAll(".filter-btn").forEach((button) => {
        button.addEventListener("click", () => {
            currentFilter = button.dataset.filter;

            document.querySelectorAll(".filter-btn").forEach((item) => {
                item.classList.remove("active");
            });

            button.classList.add("active");
            renderTasks();
        });
    });
}

function initializeApp() {
    initializeEvents();
    renderTasks();
}

initializeApp();
