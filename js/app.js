import {
    renderCalendar,
    initializeCalendar,
    getSelectedCalendarDate
} from "./calendar.js";
import { renderStatistics } from "./statistics.js";
import { loadTasks, saveTasks } from "./storage.js";
import { initializeNotes } from "./notes.js";
import { initializePomodoro } from "./pomodoro.js";

import {
    renderKanban,
    initializeKanban
} from "./kanban.js";


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
const categoryFilter = document.querySelector("#category-filter");

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

const categoryLabels = {
    study: "Estudos",
    work: "Trabalho",
    personal: "Pessoal",
    project: "Projetos",
    other: "Outros"
};

function persistTasks() {
    try {
        saveTasks(tasks);
    } catch (error) {
        console.error("Erro ao salvar tarefas:", error);
        showNotification("Não foi possível salvar. Verifique o armazenamento do navegador.");
    }
}

function formatDueDate(value) {
    if (!value) return "";

    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
}

function isOverdue(task) {
    if (!task.dueDate || task.status === "completed") {
        return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(`${task.dueDate}T00:00:00`);

    return dueDate < today;
}

function updateSummary() {
    const total = tasks.length;

    const pending = tasks.filter(
        task => task.status === "pending"
    ).length;

    const progress = tasks.filter(
        task => task.status === "progress"
    ).length;

    const completed = tasks.filter(
        task => task.status === "completed"
    ).length;

    document.querySelector("#total-tasks").textContent = total;
    document.querySelector("#pending-tasks").textContent = pending;
    document.querySelector("#progress-tasks").textContent = progress;
    document.querySelector("#completed-tasks").textContent = completed;

    const percentage = total > 0
        ? Math.round((completed / total) * 100)
        : 0;

    document.querySelector("#progress-percentage").textContent =
        `${percentage}%`;

    const progressFill = document.querySelector("#progress-fill");
    const progressTrack = document.querySelector("#progress-track");

    progressFill.style.width = `${percentage}%`;
    progressTrack.setAttribute("aria-valuenow", percentage);

    const message = total === 0
        ? "Adicione sua primeira tarefa para começar!"
        : percentage === 100
            ? "Parabéns! Todas as tarefas foram concluídas! ✨"
            : `${completed} de ${total} tarefas concluídas. Mantenha o foco!`;

    document.querySelector("#progress-message").textContent = message;
}

function renderAxolotl() {
    return `
        <div class="empty-illustration" aria-hidden="true">
            <svg class="axolotl" viewBox="0 0 120 120" fill="none"
                 xmlns="http://www.w3.org/2000/svg">
                <g stroke="#D985AD" stroke-width="3" stroke-linecap="round">
                    <path d="M33 49 C12 42 13 25 25 20 C31 17 37 24 38 36"/>
                    <path d="M32 52 C13 57 13 73 26 78 C33 81 39 71 40 61"/>
                    <path d="M87 49 C108 42 107 25 95 20 C89 17 83 24 82 36"/>
                    <path d="M88 52 C107 57 107 73 94 78 C87 81 81 71 80 61"/>
                </g>

                <path d="M29 53 C29 31 43 22 60 22 C77 22 91 31 91 53 V77 C91 94 78 103 60 103 C42 103 29 94 29 77 V53Z"
                      fill="#F5BDD3" stroke="#D985AD" stroke-width="3"/>

                <ellipse cx="48" cy="58" rx="3.5" ry="4.5" fill="#654B5C"/>
                <ellipse cx="72" cy="58" rx="3.5" ry="4.5" fill="#654B5C"/>
                <path d="M55 68 Q60 73 65 68" stroke="#BD7197" stroke-width="2.5" stroke-linecap="round"/>
                <circle cx="40" cy="69" r="5" fill="#EFAFCB" opacity=".65"/>
                <circle cx="80" cy="69" r="5" fill="#EFAFCB" opacity=".65"/>

                <path d="M47 88 Q60 82 73 88 L71 99 Q60 105 49 99Z"
                      fill="#FFFFFF" stroke="#D985AD" stroke-width="2"/>
                <path d="M48 91 H72" stroke="#D985AD" stroke-width="2"/>
                <path d="M75 89 L83 82" stroke="#D985AD" stroke-width="3" stroke-linecap="round"/>

                <path d="M60 12 L63 17 L69 18 L64 22 L65 28 L60 24 L55 28 L56 22 L51 18 L57 17Z"
                      fill="#EFAFCB"/>
            </svg>
        </div>
    `;
}

function renderEmptyState() {
    const hasTasks = tasks.length > 0;
    const isSearching = searchInput.value.trim().length > 0;
    const isCategoryFiltered = categoryFilter.value !== "all";
    const isStatusFiltered = currentFilter !== "all";

    let title = "Seu cantinho está tranquilo!";
    let description = "Adicione sua primeira tarefa e comece a organizar suas ideias.";

    if (isSearching) {
        title = "Nenhum resultado encontrado";
        description = "Tente pesquisar com outras palavras.";
    } else if (hasTasks || isCategoryFiltered || isStatusFiltered) {
        title = "Nada por aqui ainda!";
        description = "Não encontramos tarefas com esses filtros.";
    }

    taskList.innerHTML = `
        <div class="empty-state">
            ${renderAxolotl()}
            <h3>${title}</h3>
            <p>${description}</p>
        </div>
    `;
}

function renderTasks() {
    const visibleTasks = filterTasks(
        tasks,
        currentFilter,
        searchInput.value,
        categoryFilter.value
    );

    updateSummary();
    window.devCafeTasks = tasks;
    renderKanban(tasks);
    renderCalendar(tasks);
    renderStatistics(tasks);

    if (visibleTasks.length === 0) {
        renderEmptyState();
        return;
    }

    taskList.innerHTML = visibleTasks.map(task => {
        const priority = priorityLabels[task.priority] || "Média";
        const priorityClass =
            priorityClasses[task.priority] || "priority-medium";

        const status = statusLabels[task.status] || "Pendente";
        const category =
            categoryLabels[task.category || "other"] || "Outros";

        const dueDate = formatDueDate(task.dueDate);
        const overdue = isOverdue(task);

        return `
            <article class="task-card" data-id="${escapeHTML(task.id)}">
                <div class="task-info">
                    <h3>${escapeHTML(task.title)}</h3>

                    <p>${escapeHTML(task.description || "Sem descrição.")}</p>

                    <div class="task-meta">
                        <span class="priority ${priorityClass}">
                            Prioridade ${priority}
                        </span>

                        <span class="status">
                            ${status}
                        </span>

                        <span class="category-tag">
                            ${category}
                        </span>

                        ${dueDate ? `
                            <span class="due-date ${overdue ? "overdue" : ""}">
                                ${overdue ? "Atrasada · " : "Prazo · "}${dueDate}
                            </span>
                        ` : ""}

                        <span class="task-date">
                            Criada em ${formatDate(new Date(task.createdAt))}
                        </span>
                    </div>
                </div>

                <div class="task-actions">
                    <select
                        class="status-select"
                        data-action="status"
                        aria-label="Alterar status de ${escapeHTML(task.title)}"
                    >
                        <option value="pending" ${task.status === "pending" ? "selected" : ""}>Pendente</option>
                        <option value="progress" ${task.status === "progress" ? "selected" : ""}>Em andamento</option>
                        <option value="completed" ${task.status === "completed" ? "selected" : ""}>Concluída</option>
                    </select>

                    <button type="button" data-action="edit">Editar</button>
                    <button type="button" data-action="delete">Excluir</button>
                </div>
            </article>
        `;
    }).join("");
}

function handleTaskSubmit(event) {
    event.preventDefault();

    const id = document.querySelector("#task-id").value;

    const data = {
        title: document.querySelector("#task-title").value.trim(),
        description: document.querySelector("#task-description").value.trim(),
        priority: document.querySelector("#task-priority").value,
        status: document.querySelector("#task-status").value,
        category: document.querySelector("#task-category").value,
        dueDate: document.querySelector("#task-due-date").value
    };

    if (!data.title) {
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

function handleTaskClick(event) {
    const control = event.target.closest("button[data-action]");

    if (!control) return;

    const card = control.closest(".task-card");
    if (!card) return;

    const id = card.dataset.id;
    const action = control.dataset.action;

    const task = tasks.find(item => item.id === id);
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
}

function handleTaskChange(event) {
    const control = event.target.closest('select[data-action="status"]');

    if (!control) return;

    const card = control.closest(".task-card");
    if (!card) return;

    const id = card.dataset.id;

    tasks = updateTask(tasks, id, {
        status: control.value
    });

    persistTasks();
    renderTasks();

    showNotification("Status atualizado! ♡");
}

function exportBackup() {
    try {
        const savedNotes = JSON.parse(
            localStorage.getItem("devcafe-notes") || "[]"
        );

        const backup = {
            application: "DevCafé",
            version: 1,
            exportedAt: new Date().toISOString(),
            tasks: tasks,
            notes: savedNotes
        };

        const content = JSON.stringify(backup, null, 4);

        const blob = new Blob([content], {
            type: "application/json"
        });

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `devcafe-backup-${new Date()
            .toISOString()
            .slice(0, 10)}.json`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);

        showNotification("Backup exportado com sucesso! ♡");
    } catch (error) {
        console.error("Erro ao exportar backup:", error);
        showNotification("Não foi possível exportar o backup.");
    }
}


function isValidBackup(backup) {
    if (
        !backup ||
        backup.application !== "DevCafé" ||
        backup.version !== 1 ||
        !Array.isArray(backup.tasks) ||
        !Array.isArray(backup.notes)
    ) {
        return false;
    }

    const validStatuses = ["pending", "progress", "completed"];
    const validPriorities = ["low", "medium", "high"];
    const validCategories = [
        "study", "work", "personal", "project", "other"
    ];
    const validColors = ["pink", "purple", "yellow", "blue"];

    const validTasks = backup.tasks.every(task =>
        task &&
        typeof task.id === "string" &&
        typeof task.title === "string" &&
        typeof task.description === "string" &&
        validStatuses.includes(task.status) &&
        validPriorities.includes(task.priority) &&
        validCategories.includes(task.category || "other") &&
        typeof (task.dueDate || "") === "string"
    );

    const validNotes = backup.notes.every(note =>
        note &&
        typeof note.id === "string" &&
        typeof note.title === "string" &&
        typeof note.content === "string" &&
        validColors.includes(note.color)
    );

    return validTasks && validNotes;
}

async function importBackup(event) {
    const file = event.target.files[0];

    if (!file) return;

    try {
        const content = await file.text();
        const backup = JSON.parse(content);

        if (!isValidBackup(backup)) {
            showNotification("Arquivo inválido ou incompatível com o DevCafé.");
            return;
        }

        const confirmed = window.confirm(
            "Deseja restaurar este backup?\n\n" +
            "As tarefas e anotações atuais serão substituídas " +
            "pelos dados do arquivo selecionado."
        );

        if (!confirmed) return;

        saveTasks(backup.tasks);

        localStorage.setItem(
            "devcafe-notes",
            JSON.stringify(backup.notes)
        );

        showNotification("Backup restaurado! Atualizando o DevCafé... ♡");

        window.location.reload();

    } catch (error) {
        console.error("Erro ao importar backup:", error);
        showNotification("Não foi possível importar esse arquivo.");
    } finally {
        event.target.value = "";
    }
}

function updateCurrentDate() {
    const dateElement = document.querySelector("#current-date");

    const today = new Intl.DateTimeFormat("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    }).format(new Date());

    dateElement.textContent =
        today.charAt(0).toUpperCase() + today.slice(1);
}

function initializeEvents() {

    
document.addEventListener("devcafe:kanban-move", event => {
    const { id, status } = event.detail;

    if (!["pending", "progress", "completed"].includes(status)) {
        return;
    }

    tasks = updateTask(tasks, id, { status });

    persistTasks();
    renderTasks();

    showNotification("Tarefa movida no quadro! ♡");
});

  
const THEME_STORAGE_KEY = "devcafe-theme";

function applyTheme(theme) {
    const isDark = theme === "dark";

    document.documentElement.dataset.theme = isDark
        ? "dark"
        : "light";

    const toggle = document.querySelector("#theme-toggle");
    const metaThemeColor = document.querySelector(
        'meta[name="theme-color"]'
    );

    if (toggle) {
        toggle.setAttribute("aria-pressed", String(isDark));

        toggle.setAttribute(
            "aria-label",
            isDark ? "Ativar modo claro" : "Ativar modo escuro"
        );

        toggle.title = isDark
            ? "Ativar modo claro"
            : "Ativar modo escuro";

        const icon = toggle.querySelector(".theme-toggle-icon");
        const label = toggle.querySelector(".theme-toggle-label");

        if (icon) {
            icon.textContent = isDark ? "☀" : "☾";
        }

        if (label) {
            label.textContent = isDark
                ? "Modo claro"
                : "Modo escuro";
        }
    }

    if (metaThemeColor) {
        metaThemeColor.setAttribute(
            "content",
            isDark ? "#171522" : "#fff7fa"
        );
    }
}

function initializeTheme() {
    let savedTheme = "light";

    try {
        savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || "light";
    } catch (error) {
        console.warn(
            "Não foi possível recuperar a preferência de tema:",
            error
        );
    }

    applyTheme(savedTheme);

    document.querySelector("#theme-toggle")?.addEventListener(
        "click",
        () => {
            const nextTheme =
                document.documentElement.dataset.theme === "dark"
                    ? "light"
                    : "dark";

            applyTheme(nextTheme);

            try {
                localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
            } catch (error) {
                console.warn(
                    "Não foi possível salvar a preferência de tema:",
                    error
                );
            }
        }
    );
}

    
    document.querySelector("#export-backup-btn")
    .addEventListener("click", exportBackup);

    document.querySelector("#import-backup-btn")
    .addEventListener("click", () => {
        document.querySelector("#import-backup-input").click();
    });

document.querySelector("#import-backup-input")
    .addEventListener("change", importBackup);
    
    document.querySelector("#add-task-btn")
        .addEventListener("click", () => openModal());

    document.querySelector("#calendar-add-task")
    .addEventListener("click", () => {
        const selectedDate = getSelectedCalendarDate();
        openModal(null, selectedDate);
    });

    document.querySelector("#close-dialog-btn")
        .addEventListener("click", closeModal);

    document.querySelector("#cancel-dialog-btn")
        .addEventListener("click", closeModal);

    taskForm.addEventListener("submit", handleTaskSubmit);

    taskList.addEventListener("click", handleTaskClick);
    taskList.addEventListener("change", handleTaskChange);

    searchInput.addEventListener("input", renderTasks);
    categoryFilter.addEventListener("change", renderTasks);

    document.querySelectorAll(".filter-btn").forEach(button => {
        button.addEventListener("click", () => {
            currentFilter = button.dataset.filter;

            document.querySelectorAll(".filter-btn").forEach(item => {
                const active = item === button;

                item.classList.toggle("active", active);
                item.setAttribute("aria-pressed", String(active));
            });

            renderTasks();
        });
    });
}


function applyTheme(theme) {
    const isDark = theme === "dark";

    document.documentElement.dataset.theme = isDark ? "dark" : "light";

    const toggle = document.querySelector("#theme-toggle");

    if (toggle) {
        toggle.setAttribute("aria-pressed", String(isDark));
        toggle.setAttribute(
            "aria-label",
            isDark ? "Ativar modo claro" : "Ativar modo escuro"
        );

        toggle.title = isDark ? "Ativar modo claro" : "Ativar modo escuro";

        const icon = toggle.querySelector(".theme-toggle-icon");
        const label = toggle.querySelector(".theme-toggle-label");

        if (icon) icon.textContent = isDark ? "☀" : "☾";
        if (label) label.textContent = isDark ? "Modo claro" : "Modo escuro";
    }
}

function initializeTheme() {
    let savedTheme = "light";

    try {
        savedTheme = localStorage.getItem("devcafe-theme") || "light";
    } catch (error) {
        console.warn("Erro ao carregar tema:", error);
    }

    applyTheme(savedTheme);

    const toggle = document.querySelector("#theme-toggle");

    if (toggle) {
        toggle.addEventListener("click", () => {
            const currentTheme = document.documentElement.dataset.theme;
            const nextTheme = currentTheme === "dark" ? "light" : "dark";

            applyTheme(nextTheme);

            try {
                localStorage.setItem("devcafe-theme", nextTheme);
            } catch (error) {
                console.warn("Erro ao salvar tema:", error);
            }
        });
    }
}


function initializeApp() {
    initializeTheme();
    initializeEvents();
    initializeCalendar();
    initializeNotes();
    updateCurrentDate();
    initializeKanban();
    renderTasks();
    initializePomodoro();
    }

initializeApp();
