
const categoryNames = {
    study: "Estudos",
    work: "Trabalho",
    personal: "Pessoal",
    project: "Projetos",
    other: "Outros"
};

export function renderStatistics(tasks) {
    const total = tasks.length;

    const completed = tasks.filter(
        task => task.status === "completed"
    ).length;

    const pending = tasks.filter(
        task => task.status === "pending"
    ).length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdue = tasks.filter(task => {
        if (!task.dueDate || task.status === "completed") {
            return false;
        }

        return new Date(`${task.dueDate}T00:00:00`) < today;
    }).length;

    const rate = total > 0
        ? Math.round((completed / total) * 100)
        : 0;

    document.querySelector("#stats-completed-rate").textContent = `${rate}%`;
    document.querySelector("#stats-pending").textContent = pending;
    document.querySelector("#stats-overdue").textContent = overdue;

    const categoryContainer = document.querySelector("#category-stats");

    categoryContainer.innerHTML = Object.entries(categoryNames).map(
        ([key, name]) => {
            const count = tasks.filter(
                task => (task.category || "other") === key
            ).length;

            const percentage = total > 0
                ? Math.round((count / total) * 100)
                : 0;

            return `
                <div class="category-stat">
                    <div class="category-stat-info">
                        <span>${name}</span>
                        <strong>${count}</strong>
                    </div>

                    <div class="category-stat-track">
                        <div
                            class="category-stat-fill"
                            style="width: ${percentage}%"
                        ></div>
                    </div>
                </div>
            `;
        }
    ).join("");
}
