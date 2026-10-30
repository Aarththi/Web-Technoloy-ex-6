const form = document.getElementById("taskForm");
const input = document.getElementById("taskInput");
const list = document.getElementById("taskList");
const counter = document.getElementById("counter");
const emptyMessage = document.getElementById("emptyMessage");
const filterButtons = document.querySelectorAll(".filter-btn");

let tasks = [];

try {
    const savedTasks = JSON.parse(
        localStorage.getItem("toyTaskList") || "[]"
    );

    if (Array.isArray(savedTasks)) {
        tasks = savedTasks.filter(task =>
            task &&
            Number.isFinite(task.id) &&
            typeof task.text === "string" &&
            typeof task.done === "boolean"
        );
    }
} catch (error) {
    tasks = [];
}

let currentFilter = "all";

// Create a task
function createTask(text) {
    return {
        id: Date.now() + Math.random(),
        text: text,
        done: false
    };
}

// Add a task
function addTask(text) {
    tasks.push(createTask(text));
    saveAndRender();
}

// Complete or reopen a task
function toggleTask(id) {
    tasks = tasks.map(task =>
        task.id === id
            ? { ...task, done: !task.done }
            : task
    );

    saveAndRender();
}

// Delete a task
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveAndRender();
}

// Filter the tasks
function getVisible() {
    if (currentFilter === "open") {
        return tasks.filter(task => !task.done);
    }

    if (currentFilter === "finished") {
        return tasks.filter(task => task.done);
    }

    return tasks;
}

// Count unfinished tasks
function countOpen() {
    return tasks.filter(task => !task.done).length;
}

// Create a task row
function taskItem(task) {
    const item = document.createElement("li");
    item.className = "task";

    if (task.done) {
        item.classList.add("completed");
    }

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.setAttribute("aria-label", "Complete task");

    checkbox.addEventListener("change", function () {
        toggleTask(task.id);
    });

    const text = document.createElement("span");
    text.textContent = task.text;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", function () {
        deleteTask(task.id);
    });

    item.appendChild(checkbox);
    item.appendChild(text);
    item.appendChild(deleteButton);

    return item;
}

// Display the tasks
function renderTasks() {
    list.innerHTML = "";

    const visibleTasks = getVisible();

    visibleTasks.forEach(function (task) {
        list.appendChild(taskItem(task));
    });

    counter.textContent = countOpen() + " tasks left";

    emptyMessage.style.display =
        visibleTasks.length === 0 ? "block" : "none";

    if (visibleTasks.length === 0) {
        if (currentFilter === "open") {
            emptyMessage.textContent = "No open tasks!";
        } else if (currentFilter === "finished") {
            emptyMessage.textContent = "No finished tasks yet!";
        } else {
            emptyMessage.textContent =
                "No tasks yet. Add your first task!";
        }
    }
}

// Save and refresh
function saveAndRender() {
    try {
        localStorage.setItem("toyTaskList", JSON.stringify(tasks));
    } catch (error) {
        console.error("Unable to save tasks.", error);
    }

    renderTasks();
}

// Handle form submission
function handleSubmit(event) {
    event.preventDefault();

    const text = input.value.trim();

    if (text !== "") {
        addTask(text);
        input.value = "";
    } else {
        alert("Please enter a task!");
    }

    input.focus();
}

// Handle filter selection
function handleFilter(event) {
    currentFilter = event.currentTarget.dataset.filter;

    filterButtons.forEach(function (button) {
        button.classList.toggle(
            "active",
            button.dataset.filter === currentFilter
        );
    });

    renderTasks();
}

// Connect functions to events
form.addEventListener("submit", handleSubmit);

filterButtons.forEach(function (button) {
    button.addEventListener("click", handleFilter);
});

// Show tasks when the page opens
renderTasks();