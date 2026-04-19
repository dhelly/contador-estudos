document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    let state = {
        correct: 0,
        wrong: 0,
        timerActive: false,
        startTime: 0,
        elapsedTime: 0,
        partials: []
    };

    // --- DOM Elements ---
    const correctDisplay = document.getElementById('correctCount');
    const wrongDisplay = document.getElementById('wrongCount');
    const timerDisplay = document.getElementById('timer');
    const partialsList = document.getElementById('partialsList');
    const progressBar = document.getElementById('progressBar');
    const accuracyText = document.getElementById('accuracyText');

    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const resetTimerBtn = document.getElementById('resetTimerBtn');
    const correctBtn = document.getElementById('correctBtn');
    const wrongBtn = document.getElementById('wrongBtn');
    const resetCountersBtn = document.getElementById('resetCountersBtn');

    // --- Initialization ---
    loadState();
    updateUI();

    // --- Counter Logic ---
    correctBtn.addEventListener('click', () => {
        state.correct++;
        saveState();
        updateUI();
    });

    wrongBtn.addEventListener('click', () => {
        state.wrong++;
        saveState();
        updateUI();
    });

    resetCountersBtn.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja zerar os contadores?')) {
            state.correct = 0;
            state.wrong = 0;
            saveState();
            updateUI();
        }
    });

    // --- Timer Logic ---
    let timerInterval;

    startBtn.addEventListener('click', () => {
        if (!state.timerActive) {
            state.timerActive = true;
            state.startTime = Date.now() - state.elapsedTime;
            timerInterval = setInterval(updateTimer, 10);
            startBtn.disabled = true;
            pauseBtn.disabled = false;
        }
    });

    pauseBtn.addEventListener('click', () => {
        if (state.timerActive) {
            state.timerActive = false;
            clearInterval(timerInterval);
            
            // Save partial
            const currentPartial = formatTime(state.elapsedTime);
            state.partials.unshift({
                time: currentPartial,
                timestamp: new Date().toLocaleTimeString()
            });
            
            saveState();
            updateUI();
            
            startBtn.disabled = false;
            pauseBtn.disabled = true;
        }
    });

    resetTimerBtn.addEventListener('click', () => {
        if (confirm('Deseja resetar o cronômetro? Isso também apagará todas as parciais salvas.')) {
            state.timerActive = false;
            clearInterval(timerInterval);
            state.elapsedTime = 0;
            state.partials = [];
            saveState();
            updateUI();
            startBtn.disabled = false;
            pauseBtn.disabled = true;
        }
    });

    function updateTimer() {
        state.elapsedTime = Date.now() - state.startTime;
        timerDisplay.textContent = formatTime(state.elapsedTime);
    }

    function formatTime(ms) {
        let totalSeconds = Math.floor(ms / 1000);
        let hours = Math.floor(totalSeconds / 3600);
        let minutes = Math.floor((totalSeconds % 3600) / 60);
        let seconds = totalSeconds % 60;

        return [hours, minutes, seconds]
            .map(v => v < 10 ? "0" + v : v)
            .join(":");
    }

    // --- UI Update ---
    function updateUI() {
        correctDisplay.textContent = state.correct;
        wrongDisplay.textContent = state.wrong;
        timerDisplay.textContent = formatTime(state.elapsedTime);

        // Accuracy and Progress
        const total = state.correct + state.wrong;
        const accuracy = total === 0 ? 0 : Math.round((state.correct / total) * 100);
        
        progressBar.style.width = `${accuracy}%`;
        accuracyText.textContent = `Precisão: ${accuracy}% (${total} questões)`;

        // Update Partials
        partialsList.innerHTML = '';
        state.partials.forEach(p => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${p.timestamp}</span> <strong>${p.time}</strong>`;
            partialsList.appendChild(li);
        });
    }

    // --- Persistence ---
    function saveState() {
        localStorage.setItem('estudoMasterState', JSON.stringify({
            correct: state.correct,
            wrong: state.wrong,
            partials: state.partials
        }));
    }

    function loadState() {
        const saved = localStorage.getItem('estudoMasterState');
        if (saved) {
            const parsed = JSON.parse(saved);
            state.correct = parsed.correct || 0;
            state.wrong = parsed.wrong || 0;
            state.partials = parsed.partials || [];
        }
    }
});
