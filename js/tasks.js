
export function createTask(data) {
    return {
        id: crypto.randomUUID(),
        title: data.title.trim(),
        description: (data.description || "").trim(),
        priority: data.priority,
        status: data.status,
        category: data.category || "other",
        dueDate: data.dueDate || "",
        createdAt: new Date().toISOString()
    };
}

export function updateTask(tasks, id, changes) {
    return tasks.map((task) =>
        task.id === id
            ? { ...task, ...changes }
            : task
    );
}

export function deleteTask(tasks, id) {
    return tasks.filter((task) => task.id !== id);
}

export function filterTasks(tasks, filter, search = "", category = "all") {
    const normalizedSearch = search.toLowerCase().trim();

    return tasks.filter((task) => {
        const matchesStatus =
            filter === "all" || task.status === filter;

        const matchesSearch =
            (task.title || "").toLowerCase().includes(normalizedSearch) ||
            (task.description || "").toLowerCase().includes(normalizedSearch);

        const matchesCategory =
            category === "all" ||
            (task.category || "other") === category;

        return matchesStatus && matchesSearch && matchesCategory;
    });
}
