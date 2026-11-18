
const FOCUS_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;
const SESSION_KEY = "devcafe-pomodoro-sessions";

let mode = "focus";
let remainingTime = FOCUS_TIME;
let interval = null;
let sessions = Number(localStorage.getItem(SESSION_KEY)) || 0;

const timerDisplay = document.querySelector("#pomodoro-time");
const modeLabel = document.querySelector("#pomodoro-mode");
const startButton = document.querySelector("#pomodoro-start");
const resetButton = document.querySelector("#pomodoro-reset");
const taskSelect = document.querySelector("#pomodoro-task");
const sessionDisplay = document.querySelector("#pomodoro-sessions");

function updateDisplay() {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;

    timerDisplay.textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    modeLabel.textContent =
        mode === "focus" ? "Hora de focar!" : "Hora de descansar!";

    sessionDisplay.textContent = sessions;
    document.title = `${timerDisplay.textContent} | DevCafé`;
}

function updateTaskOptions() {
    const tasks = window.devCafeTasks || [];
    const selectedValue = taskSelect.value;

    taskSelect.innerHTML = `
        <option value="">Nenhuma tarefa selecionada</option>
        ${tasks.filter(task => task.status !== "completed").map(task => `
            <option value="${task.id}">${escapeText(task.title)}</option>
        `).join("")}
    `;

    taskSelect.value = tasks.some(task => task.id === selectedValue)
        ? selectedValue
        : "";
}

function escapeText(value) {
    const element = document.createElement("span");
    element.textContent = value || "";
    return element.innerHTML;
}

function finishTimer() {
    clearInterval(interval);
    interval = null;

    if (mode === "focus") {
        sessions += 1;
        localStorage.setItem(SESSION_KEY, String(sessions));
        mode = "break";
        remainingTime = BREAK_TIME;
        alert("Parabéns! Você concluiu uma sessão de foco. Hora de descansar! ☕");
    } else {
        mode = "focus";
        remainingTime = FOCUS_TIME;
        alert("Pausa finalizada! Vamos voltar com calma. ♡");
    }

    startButton.textContent = "Iniciar";
    updateDisplay();
}

function startTimer() {
    if (interval) {
        clearInterval(interval);
        interval = null;
        startButton.textContent = "Continuar";
        return;
    }

    startButton.textContent = "Pausar";

    interval = setInterval(() => {
        remainingTime -= 1;
        updateDisplay();

        if (remainingTime <= 0) {
            finishTimer();
        }
    }, 1000);
}

function resetTimer() {
    clearInterval(interval);
    interval = null;

    remainingTime = mode === "focus" ? FOCUS_TIME : BREAK_TIME;
    startButton.textContent = "Iniciar";

    updateDisplay();
}

export function initializePomodoro() {
    if (!timerDisplay || !startButton || !resetButton || !taskSelect) {
        return;
    }

    startButton.addEventListener("click", startTimer);
    resetButton.addEventListener("click", resetTimer);

    updateTaskOptions();
    updateDisplay();
}

