console.log('Javascript已連結，準備進行互動...');

let visitorName = localStorage.getItem('visitorName') || '';
let visitorAvatar = localStorage.getItem('visitorAvatar') || '';

const logoElement = document.getElementById('main_logo');
const heroTitle = document.getElementById('hero-title');

function updateUserInfo(name, avatarUrl) {
    visitorName = name;
    visitorAvatar = avatarUrl;
    
    localStorage.setItem('visitorName', name);
    localStorage.setItem('visitorAvatar', avatarUrl);
    
    if (avatarUrl) {
        logoElement.innerHTML = `<img src="${avatarUrl}" class="user-avatar" alt="Avatar"> <b>${name}</b>'s Website`;
    } else {
        logoElement.innerHTML = `<b>${name}</b>'s Website`;
    }
    
    if (heroTitle) {
        heroTitle.innerHTML = `我的未來，由<span class="highlight">${name}</span>主宰`;
    }
}

const welcomeModal = document.getElementById('welcome-modal');
const btnNewcomer = document.getElementById('btn-newcomer');
const btnVisitor = document.getElementById('btn-visitor');
const modalChoices = document.getElementById('modal-choices');
const nameInputSection = document.getElementById('name-input-section');
const visitorNameInput = document.getElementById('visitor-name-input');
const btnSubmitName = document.getElementById('btn-submit-name');

function showModal() {
    welcomeModal.style.display = 'flex';
    modalChoices.style.display = 'flex';
    nameInputSection.style.display = 'none';
    visitorNameInput.value = '';
}

function hideModal() {
    welcomeModal.style.display = 'none';
}

btnVisitor.addEventListener('click', () => {
    updateUserInfo('訪客', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest');
    hideModal();
});

btnNewcomer.addEventListener('click', () => {
    modalChoices.style.display = 'none';
    nameInputSection.style.display = 'block';
    visitorNameInput.focus();
});

function submitName() {
    let name = visitorNameInput.value.trim();
    if (name === '') {
        name = '新朋友';
    }
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
    updateUserInfo(name, avatarUrl);
    hideModal();
}

btnSubmitName.addEventListener('click', submitName);
visitorNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        submitName();
    }
});

showModal();
if (visitorName) {
    updateUserInfo(visitorName, visitorAvatar);
} else {
    updateUserInfo('訪客', '');
}

const commandInput = document.getElementById('command-input');
const sendPromptBtn = document.getElementById('send-prompt');
const commandStatus = document.getElementById('command-status');
const changeColorBtn = document.getElementById('change-color-btn');
const menuBtn = document.getElementById('menu-btn');
const navLink = document.getElementById('nav-link');

function closeMenu() {
    navLink.classList.remove('open');
    menuBtn.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
}

function toggleMenu() {
    const isOpen = navLink.classList.toggle('open');
    menuBtn.classList.toggle('is-open', isOpen);
    menuBtn.setAttribute('aria-expanded', String(isOpen));
}

menuBtn.addEventListener('click', toggleMenu);

navLink.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
});

const themeClasses = ['theme-sky', 'theme-indigo', 'theme-green', 'theme-red'];

let themeIndex = 0;

function applyNextTheme() {
    themeIndex = (themeIndex + 1) % themeClasses.length;

    document.documentElement.classList.remove(...themeClasses);
    document.documentElement.classList.add(themeClasses[themeIndex]);
}

changeColorBtn.addEventListener('click', applyNextTheme);

const bgClasses = ['bg-classic', 'bg-dots', 'bg-star-char', 'bg-cloud-char', 'bg-heart-char', 'bg-clover-char'];
const bgNames = {
    'bg-classic': '經典',
    'bg-dots': '點點',
    'bg-star-char': '星星',
    'bg-cloud-char': '雲朵',
    'bg-heart-char': '愛心',
    'bg-clover-char': '幸運草'
};
let bgIndex = 0;

function applyNextBackground() {
    bgIndex = (bgIndex + 1) % bgClasses.length;
    document.body.classList.remove(...bgClasses);
    document.body.classList.add(bgClasses[bgIndex]);
}

const TODO_STORAGE_KEY = 'improved-todo-list-todos';
const TODO_ADD_PATTERN = /^(?:新增待辦|待辦新增|todo)[:：\s]*(.*)$/i;

function loadTodosFromStorage() {
    const saved = localStorage.getItem(TODO_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
}

function addTodoFromCommand(text) {
    const todos = loadTodosFromStorage();
    todos.push({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2),
        text,
        time: null,
        completed: false
    });
    localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(todos));
}

function handleCommand() {
    const command = commandInput.value.trim();

    if (command === '') {
        commandStatus.textContent = 'AI 助理：請先輸入指令再發送！';
        commandInput.focus();
        return;
    }

    const todoAddMatch = command.match(TODO_ADD_PATTERN);

    if (todoAddMatch) {
        const todoText = todoAddMatch[1].trim();
        if (todoText === '') {
            commandStatus.textContent = 'AI 助理：請在指令後面輸入待辦內容，例如「新增待辦 買牛奶」。';
        } else {
            addTodoFromCommand(todoText);
            commandStatus.textContent = `AI 助理：已經把「${todoText}」加入待辦清單囉！可以點導覽列的「待辦事項」查看。`;
        }
    } else if (command.includes('查看待辦') || command.includes('待辦清單')) {
        const todos = loadTodosFromStorage();
        const uncompletedCount = todos.filter((todo) => !todo.completed).length;
        commandStatus.textContent = `AI 助理：目前共有 ${todos.length} 筆待辦，其中 ${uncompletedCount} 筆尚未完成。可以點導覽列的「待辦事項」查看完整清單。`;
    } else if (command.includes('你好') || command.includes('妳好') || command.includes('哈囉') || command.includes('嗨')) {
        commandStatus.textContent = `AI 助理：你好 ${visitorName}！很高興見到你 😊`;
    } else if (command.includes('學校')) {
        commandStatus.textContent = 'AI 助理：這是我在東吳大學基礎網頁設計課的第一個自製網站！';
    } else if (command.includes('功能')) {
        commandStatus.textContent = 'AI 助理：你可以輸入「你好」、「學校」、「功能」、「變換顏色」，或試試「新增待辦 買牛奶」、「查看待辦」。';
    } else if (command.includes('變換顏色') || command.includes('換色') || command.includes('顏色')) {
        applyNextTheme();
        commandStatus.textContent = 'AI 助理：已經幫你變換顏色囉！';
    } else if (command.includes('更換背景') || command.includes('換背景')) {
        applyNextBackground();
        const currentBgName = bgNames[bgClasses[bgIndex]] || '新';
        commandStatus.textContent = `AI 助理：背景已更換為「${currentBgName}」風格！`;
    } else {
        commandStatus.textContent = `AI 助理：已收到指令「${command}」，正在處理中...`;
    }

    commandInput.value = '';
    commandInput.focus();
}

sendPromptBtn.addEventListener('click', handleCommand);

commandInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        handleCommand();
    }
});

document.querySelectorAll('.example-tag').forEach((tag) => {
    tag.addEventListener('click', () => {
        const cmd = tag.getAttribute('data-cmd');
        if (cmd && commandInput) {
            commandInput.value = cmd;
            commandInput.focus();
        }
    });
});

document.querySelectorAll('.name-tag').forEach((tag) => {
    tag.addEventListener('click', () => {
        const name = tag.getAttribute('data-name');
        if (name && visitorNameInput) {
            visitorNameInput.value = name;
            visitorNameInput.focus();
        }
    });
});
