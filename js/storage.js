
const STORAGE_KEY = "devcafe-tasks";

export function loadTasks() {
    try {
        const savedTasks = localStorage.getItem(STORAGE_KEY);
        return savedTasks ? JSON.parse(savedTasks) : [];
    } catch (error) {
        console.error("Erro ao carregar tarefas:", error);
        return [];
    }
}

export function saveTasks(tasks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
