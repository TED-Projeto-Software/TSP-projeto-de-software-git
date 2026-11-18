
import { escapeHTML } from "./utils.js";

const calendarGrid = document.querySelector("#calendar-grid");
const monthLabel = document.querySelector("#calendar-month");
const selectedDateLabel = document.querySelector("#selected-date-label");
const dayTaskList = document.querySelector("#calendar-day-tasks");

let currentMonth = new Date();
currentMonth.setDate(1);

let selectedDate = toDateKey(new Date());

function toDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function formatDate(dateKey) {
    const [year, month, day] = dateKey.split("-");
    return `${day}/${month}/${year}`;
}

function renderDayTasks(tasks) {
    const dayTasks = tasks.filter(task => task.dueDate === selectedDate);

    selectedDateLabel.textContent = formatDate(selectedDate);

    if (dayTasks.length === 0) {
        dayTaskList.innerHTML = `
            <p class="calendar-empty-message">
                Nenhuma tarefa com prazo para este dia. ♡
            </p>
        `;
        return;
    }

    dayTaskList.innerHTML = dayTasks.map(task => `
        <article class="calendar-task">
            <span class="calendar-task-dot"></span>
            <div>
                <strong>${escapeHTML(task.title)}</strong>
                <small>${escapeHTML(task.status === "completed"
                    ? "Concluída"
                    : task.status === "progress"
                        ? "Em andamento"
                        : "Pendente")}</small>
            </div>
        </article>
    `).join("");
}

export function renderCalendar(tasks) {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    monthLabel.textContent = new Intl.DateTimeFormat("pt-BR", {
        month: "long",
        year: "numeric"
    }).format(currentMonth);

    const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayKey = toDateKey(new Date());

    let daysHTML = "";

    for (let i = 0; i < firstWeekday; i++) {
        daysHTML += `<span class="calendar-empty-cell"></span>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = toDateKey(new Date(year, month, day));
        const hasTasks = tasks.some(task => task.dueDate === dateKey);

        const classes = [
            "calendar-day",
            dateKey === selectedDate ? "selected" : "",
            dateKey === todayKey ? "today" : "",
            hasTasks ? "has-tasks" : ""
        ].filter(Boolean).join(" ");

        daysHTML += `
            <button
                type="button"
                class="${classes}"
                data-date="${dateKey}"
                aria-label="${day}${hasTasks ? ", possui tarefas" : ""}"
                aria-pressed="${dateKey === selectedDate}"
            >
                ${day}
                ${hasTasks ? '<span class="calendar-day-indicator"></span>' : ""}
            </button>
        `;
    }

    calendarGrid.innerHTML = daysHTML;
    renderDayTasks(tasks);
}

export function initializeCalendar() {
    document.querySelector("#calendar-prev").addEventListener("click", () => {
        currentMonth.setMonth(currentMonth.getMonth() - 1);
        selectedDate = toDateKey(currentMonth);
        renderCalendar(window.devCafeTasks || []);
    });

    document.querySelector("#calendar-next").addEventListener("click", () => {
        currentMonth.setMonth(currentMonth.getMonth() + 1);
        selectedDate = toDateKey(currentMonth);
        renderCalendar(window.devCafeTasks || []);
    });

    calendarGrid.addEventListener("click", event => {
        const button = event.target.closest("[data-date]");

        if (!button) return;

        selectedDate = button.dataset.date;
        renderCalendar(window.devCafeTasks || []);
    });
    export function getSelectedCalendarDate() {
    return selectedDate;
}
}
