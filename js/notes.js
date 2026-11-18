
import { escapeHTML } from "./utils.js";

const STORAGE_KEY = "devcafe-notes";

let notes = loadNotes();

const notesGrid = document.querySelector("#notes-grid");
const noteDialog = document.querySelector("#note-dialog");
const noteForm = document.querySelector("#note-form");
const searchInput = document.querySelector("#notes-search");

function loadNotes() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (error) {
        console.error("Erro ao carregar anotações:", error);
        return [];
    }
}

function saveNotes() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (error) {
        console.error("Erro ao salvar anotações:", error);
        alert("Não foi possível salvar suas anotações.");
    }
}

function openNoteModal(note = null) {
    noteForm.reset();

    document.querySelector("#note-id").value = note?.id || "";
    document.querySelector("#note-title").value = note?.title || "";
    document.querySelector("#note-content").value = note?.content || "";
    document.querySelector("#note-color").value = note?.color || "pink";

    document.querySelector("#note-dialog-title").textContent =
        note ? "Editar anotação" : "Nova anotação";

    noteDialog.showModal();
}

function closeNoteModal() {
    noteDialog.close();
}

function renderNotes() {
    const search = searchInput.value.toLowerCase().trim();

    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(search) ||
        note.content.toLowerCase().includes(search)
    );

    if (filteredNotes.length === 0) {
        notesGrid.innerHTML = `
            <div class="notes-empty">
                <span>✿</span>
                <h3>${search ? "Nenhuma anotação encontrada" : "Seu mural está vazio!"}</h3>
                <p>${search
                    ? "Tente pesquisar com outras palavras."
                    : "Crie seu primeiro post-it e guarde suas ideias aqui. ♡"
                }</p>
            </div>
        `;
        return;
    }

    notesGrid.innerHTML = filteredNotes.map(note => `
        <article class="note-card note-${escapeHTML(note.color)}"
                 data-id="${escapeHTML(note.id)}">

            <span class="note-decoration">♡</span>

            <h3>${escapeHTML(note.title)}</h3>

            <p>${escapeHTML(note.content).replace(/\n/g, "<br>")}</p>

            <div class="note-actions">
                <button type="button" data-action="edit">
                    Editar
                </button>

                <button type="button" data-action="delete">
                    Excluir
                </button>
            </div>
        </article>
    `).join("");
}

function handleNoteSubmit(event) {
    event.preventDefault();

    const id = document.querySelector("#note-id").value;

    const noteData = {
        title: document.querySelector("#note-title").value.trim(),
        content: document.querySelector("#note-content").value.trim(),
        color: document.querySelector("#note-color").value
    };

    if (!noteData.title) return;

    if (id) {
        notes = notes.map(note =>
            note.id === id
                ? { ...note, ...noteData }
                : note
        );
    } else {
        notes.unshift({
            id: crypto.randomUUID(),
            ...noteData,
            createdAt: new Date().toISOString()
        });
    }

    saveNotes();
    renderNotes();
    closeNoteModal();
}

function handleNoteActions(event) {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const card = button.closest(".note-card");
    const id = card.dataset.id;

    const note = notes.find(item => item.id === id);

    if (!note) return;

    if (button.dataset.action === "edit") {
        openNoteModal(note);
    }

    if (button.dataset.action === "delete") {
        const confirmed = confirm(
            `Deseja excluir a anotação "${note.title}"?`
        );

        if (!confirmed) return;

        notes = notes.filter(item => item.id !== id);

        saveNotes();
        renderNotes();
    }
}

export function initializeNotes() {
    document.querySelector("#add-note-btn")
        .addEventListener("click", () => openNoteModal());

    document.querySelector("#close-note-dialog")
        .addEventListener("click", closeNoteModal);

    document.querySelector("#cancel-note-dialog")
        .addEventListener("click", closeNoteModal);

    noteForm.addEventListener("submit", handleNoteSubmit);

    notesGrid.addEventListener("click", handleNoteActions);

    searchInput.addEventListener("input", renderNotes);

    renderNotes();
}
