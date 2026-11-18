
let notificationTimeout;

export function showNotification(message) {
    const toast = document.querySelector("#toast");

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(notificationTimeout);

    notificationTimeout = setTimeout(() => {
        toast.classList.remove("show");
    }, 2800);
}
