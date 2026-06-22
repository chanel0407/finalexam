// 全域狀態：待辦清單陣列，以及尚未觸發的提醒計時器
let todos = [];
const reminderTimers = new Map();

// localStorage 用獨立的 key，避免用 file:// 開啟時跟其他版本的待辦清單互相覆蓋
const STORAGE_KEY = 'improved-todo-list-todos';

// 從 localStorage 載入待辦清單
function loadTodos() {
    const saved = localStorage.getItem(STORAGE_KEY);
    todos = saved ? JSON.parse(saved) : [];
}

// 將目前的待辦清單寫回 localStorage
function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// 將 datetime-local 的值格式化成「YYYY-MM-DD HH:mm」
function formatDateTime(value) {
    const date = new Date(value);
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// 顯示桌面通知
function notifyUser(task, time) {
    if (Notification.permission === 'granted') {
        new Notification('提醒事項', { body: `${task}（${formatDateTime(time)}）` });
    }
}

// 第一次設定提醒時間時才詢問通知權限，避免一進頁面就跳權限視窗
function ensureNotificationPermission() {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// 為單筆待辦排程提醒；若已完成、沒設時間、或時間已過則不排程
function scheduleReminder(todo) {
    if (reminderTimers.has(todo.id)) {
        clearTimeout(reminderTimers.get(todo.id));
        reminderTimers.delete(todo.id);
    }

    if (!todo.time || todo.completed) return;

    const delay = new Date(todo.time) - new Date();
    if (delay <= 0) return;

    const timerId = setTimeout(() => {
        notifyUser(todo.text, todo.time);
        reminderTimers.delete(todo.id);
    }, delay);
    reminderTimers.set(todo.id, timerId);
}

// 新增待辦事項
function addTodo(event) {
    event.preventDefault();

    const input = document.getElementById('todo-input');
    const timeInput = document.getElementById('todo-time');
    const text = input.value.trim();
    if (!text) return;

    const time = timeInput.value || null;
    if (time) ensureNotificationPermission();

    const todo = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2),
        text,
        time,
        completed: false
    };

    todos.push(todo);
    saveTodos();
    scheduleReminder(todo);
    render();

    input.value = '';
    timeInput.value = '';
    input.focus();
}

// 切換完成狀態：完成時取消提醒，取消完成時若時間仍未到則重新排程
function toggleComplete(id) {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    todo.completed = !todo.completed;
    saveTodos();
    scheduleReminder(todo);
    render();
}

// 刪除待辦事項，並清除對應的提醒計時器
function deleteTodo(id) {
    if (reminderTimers.has(id)) {
        clearTimeout(reminderTimers.get(id));
        reminderTimers.delete(id);
    }
    todos = todos.filter((t) => t.id !== id);
    saveTodos();
    render();
}

// 依目前的 todos 重新繪製清單
function render() {
    const list = document.getElementById('todo-list');
    const emptyMessage = document.getElementById('empty-message');
    list.innerHTML = '';

    emptyMessage.style.display = todos.length === 0 ? 'block' : 'none';

    todos.forEach((todo) => {
        const li = document.createElement('li');
        li.className = 'todo-item' + (todo.completed ? ' completed' : '');

        const content = document.createElement('div');
        content.className = 'todo-content';
        content.addEventListener('click', () => toggleComplete(todo.id));

        const textSpan = document.createElement('span');
        textSpan.className = 'todo-text';
        textSpan.textContent = todo.text;

        const timeSpan = document.createElement('span');
        timeSpan.className = 'todo-time';
        timeSpan.textContent = todo.time ? `提醒時間：${formatDateTime(todo.time)}` : '沒有設定提醒時間';

        content.appendChild(textSpan);
        content.appendChild(timeSpan);

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'delete-btn';
        deleteBtn.setAttribute('aria-label', '刪除這筆待辦事項');
        deleteBtn.textContent = '✕';
        deleteBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            deleteTodo(todo.id);
        });

        li.appendChild(content);
        li.appendChild(deleteBtn);
        list.appendChild(li);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadTodos();
    todos.forEach(scheduleReminder);
    render();
    document.getElementById('todo-form').addEventListener('submit', addTodo);
});
