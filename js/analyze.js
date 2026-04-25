// Analyze Page: Tabs, Upload, and History (localStorage)
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initUpload();
    initHistory();
    initAnalyzeButtons();
});

/* ---------- Tabs ---------- */
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.tab;

            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `tab-${target}`) {
                    content.classList.add('active');
                }
            });
        });
    });
}

/* ---------- Upload ---------- */
function initUpload() {
    const uploadZone = document.getElementById('upload-zone');
    const fileInput = uploadZone?.querySelector('input[type="file"]');
    const placeholder = uploadZone?.querySelector('.upload-placeholder');
    const preview = uploadZone?.querySelector('.upload-preview');
    const previewImg = preview?.querySelector('img');
    const previewName = preview?.querySelector('.filename');
    const removeBtn = preview?.querySelector('.remove-file');

    if (!uploadZone || !fileInput || !placeholder || !preview) return;

    uploadZone.addEventListener('click', (e) => {
        if (e.target.tagName !== 'INPUT' && !e.target.closest('.remove-file')) {
            fileInput.click();
        }
    });

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadZone.addEventListener(eventName, () => {
            uploadZone.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadZone.addEventListener(eventName, () => {
            uploadZone.classList.remove('dragover');
        }, false);
    });

    uploadZone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) handleFile(files[0]);
    });

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) handleFile(fileInput.files[0]);
    });

    removeBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        resetUpload();
    });

    function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file.');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            previewName.textContent = file.name;
            placeholder.style.display = 'none';
            preview.style.display = 'flex';
        };
        reader.readAsDataURL(file);
    }

    function resetUpload() {
        fileInput.value = '';
        previewImg.src = '';
        previewName.textContent = '';
        preview.style.display = 'none';
        placeholder.style.display = 'block';
    }
}

/* ---------- Analyze Buttons (simulate + save to history) ---------- */
function initAnalyzeButtons() {
    const urlBtn = document.querySelector('#tab-url .btn-primary');
    const textBtn = document.querySelector('#tab-text .btn-primary');
    const imageBtn = document.querySelector('#tab-image .btn-primary');

    urlBtn?.addEventListener('click', () => {
        const input = document.getElementById('url-input');
        const url = input?.value.trim();
        if (!url) return alert('Please enter a URL.');
        const result = simulateAnalysis('url', url);
        addHistoryItem(result);
        updateResultsPanel(result);
        input.value = '';
    });

    textBtn?.addEventListener('click', () => {
        const input = document.getElementById('text-input');
        const text = input?.value.trim();
        if (!text) return alert('Please paste some text.');
        const result = simulateAnalysis('text', text.substring(0, 60) + (text.length > 60 ? '...' : ''));
        addHistoryItem(result);
        updateResultsPanel(result);
        input.value = '';
    });

    imageBtn?.addEventListener('click', () => {
        const previewName = document.querySelector('#tab-image .filename');
        const name = previewName?.textContent.trim();
        if (!name) return alert('Please upload an image first.');
        const result = simulateAnalysis('image', name);
        addHistoryItem(result);
        updateResultsPanel(result);
        // reset upload
        document.querySelector('.remove-file')?.click();
    });
}

function simulateAnalysis(type, title) {
    const isReal = Math.random() > 0.4;
    const score = isReal
        ? Math.floor(Math.random() * 15) + 80  // 80-95
        : Math.floor(Math.random() * 30) + 35; // 35-65
    const labels = isReal
        ? ['Source Verified', 'Balanced Tone', 'High Credibility']
        : ['Unreliable Source', 'Emotional Bias', 'Clickbait Detected'];
    const label = labels[Math.floor(Math.random() * labels.length)];

    return {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        type,
        title,
        result: isReal ? 'real' : 'fake',
        score,
        label,
        date: new Date().toISOString()
    };
}

function updateResultsPanel(item) {
    const scoreNum = document.querySelector('.score-number');
    const scoreLabel = document.querySelector('.score-label');
    const progress = document.querySelector('.score-ring .progress');
    const badges = document.querySelector('.result-badges');

    if (scoreNum) scoreNum.textContent = item.score;
    if (scoreLabel) scoreLabel.textContent = item.result === 'real' ? '% Real' : '% Fake';

    // Update ring dashoffset (circumference ≈ 327)
    const offset = 327 - (327 * item.score / 100);
    if (progress) progress.style.strokeDashoffset = offset;

    // Update badges
    if (badges) {
        const icon = item.result === 'real' ? 'fa-circle-check' : 'fa-triangle-exclamation';
        const badgeClass = item.result === 'real' ? 'verified' : 'warning';
        const color = item.result === 'real' ? '#16a34a' : '#d97706';
        badges.innerHTML = `
            <div class="result-badge ${badgeClass}">
                <i class="fa-solid ${icon}"></i>
                <span>${item.label}</span>
            </div>
        `;
    }

    // Update breakdown bars
    const bars = document.querySelectorAll('.breakdown-bar > div');
    const spans = document.querySelectorAll('.breakdown-item > span:last-child');
    if (bars.length >= 3 && spans.length >= 3) {
        const base = item.score;
        [base, Math.max(20, base - 15), Math.min(100, base + 10)].forEach((v, i) => {
            bars[i].style.width = v + '%';
            spans[i].textContent = v + '%';
        });
    }
}

/* ---------- History (localStorage) ---------- */
const HISTORY_KEY = 'truthlens_history';

function getHistory() {
    try {
        return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    } catch {
        return [];
    }
}

function saveHistory(list) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 50)));
}

function seedDemoHistory() {
    const existing = getHistory();
    if (existing.length > 0) return;
    const demos = [
        { id: 'demo-1', type: 'url', title: 'cnn.com/politics/article', result: 'real', score: 91, label: 'Source Verified', date: new Date(Date.now() - 86400000 * 2).toISOString() },
        { id: 'demo-2', type: 'text', title: 'Breaking: Scientists discover...', result: 'fake', score: 42, label: 'Clickbait Detected', date: new Date(Date.now() - 86400000).toISOString() },
        { id: 'demo-3', type: 'image', title: 'protest_photo.jpg', result: 'real', score: 88, label: 'Balanced Tone', date: new Date(Date.now() - 3600000 * 5).toISOString() },
        { id: 'demo-4', type: 'url', title: 'dallybuzz.com/shocking-news', result: 'fake', score: 37, label: 'Unreliable Source', date: new Date(Date.now() - 3600000 * 2).toISOString() },
    ];
    saveHistory(demos);
}

function initHistory() {
    seedDemoHistory();
    renderHistory();

    document.getElementById('clear-history')?.addEventListener('click', () => {
        if (confirm('Clear all analysis history?')) {
            localStorage.removeItem(HISTORY_KEY);
            renderHistory();
        }
    });
}

function addHistoryItem(item) {
    const list = getHistory();
    list.unshift(item);
    saveHistory(list);
    renderHistory();
}

function renderHistory() {
    const container = document.getElementById('history-list');
    const empty = document.getElementById('history-empty');
    const list = getHistory();

    if (!container) return;

    if (list.length === 0) {
        container.innerHTML = '';
        if (empty) empty.style.display = 'block';
        return;
    }

    if (empty) empty.style.display = 'none';

    const typeIcons = {
        url: 'fa-link',
        text: 'fa-keyboard',
        image: 'fa-image'
    };

    container.innerHTML = list.map(item => {
        const date = new Date(item.date);
        const timeStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const resultClass = item.result;
        const resultIcon = item.result === 'real' ? 'fa-check' : 'fa-xmark';

        return `
            <div class="history-card">
                <div class="history-icon">
                    <i class="fa-solid ${typeIcons[item.type] || 'fa-file'}"></i>
                </div>
                <div class="history-info">
                    <p class="history-title">${escapeHtml(item.title)}</p>
                    <p class="history-meta">${capitalize(item.type)} · ${timeStr}</p>
                </div>
                <div class="history-result ${resultClass}">
                    <i class="fa-solid ${resultIcon}"></i>
                    ${capitalize(item.result)}
                </div>
                <div class="history-score">${item.score}%</div>
            </div>
        `;
    }).join('');
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

