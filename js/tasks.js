
export function createTask(data) {
    return {
        id: crypto.randomUUID(),
        title: data.title.trim(),
        description: data.description.trim(),
        priority: data.priority,
        status: data.status,
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

export function filterTasks(tasks, filter, search = "") {
    const normalizedSearch = search.toLowerCase().trim();

    return tasks.filter((task) => {
        const matchesStatus =
            filter === "all" || task.status === filter;

        const matchesSearch =
            task.title.toLowerCase().includes(normalizedSearch) ||
            task.description.toLowerCase().includes(normalizedSearch);

        return matchesStatus && matchesSearch;
    });
}
