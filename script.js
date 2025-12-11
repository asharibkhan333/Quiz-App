// Game State
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timer = null;
let timeLeft = 15;
let answered = false;

// Initialize
function init() {
    initTheme();
    displayHighScore();
    startBtn.addEventListener('click', startQuiz);
    nextBtn.addEventListener('click', nextQuestion);
    restartBtn.addEventListener('click', restartQuiz);
    themeToggle.addEventListener('click', toggleTheme);
}

// Display High Score
function displayHighScore() {
    const highScore = localStorage.getItem('quizHighScore');
    if (highScore) {
        highScoreDisplayEl.textContent = `🏆 High Score: ${highScore}/10`;
    }
}

// Shuffle Array (Fisher-Yates)
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Start Quiz
function startQuiz() {
    // Reset state
    currentQuestionIndex = 0;
    score = 0;
    answered = false;

    // Shuffle and select 10 questions
    questions = shuffleArray(questionsDB).slice(0, 10);

    // Shuffle options for each question while tracking correct answer
    questions = questions.map(q => {
        const optionsWithIndex = q.options.map((opt, idx) => ({
            text: opt,
            isCorrect: idx === q.correct
        }));
        const shuffledOptions = shuffleArray(optionsWithIndex);
        return {
            question: q.question,
            options: shuffledOptions.map(o => o.text),
            correct: shuffledOptions.findIndex(o => o.isCorrect)
        };
    });

    // Switch screens
    switchScreen(startScreen, quizScreen);

    // Load first question
    loadQuestion();
}

// Switch Screens
function switchScreen(from, to) {
    from.classList.remove('active');
    to.classList.add('active');
}

// Load Question
function loadQuestion() {
    answered = false;
    nextBtn.disabled = true;

    const question = questions[currentQuestionIndex];

    // Update UI
    currentQuestionEl.textContent = currentQuestionIndex + 1;
    scoreDisplayEl.textContent = `Score: ${score}`;
    progressFillEl.style.width = `${((currentQuestionIndex + 1) / 10) * 100}%`;

    // Set question
    questionEl.textContent = question.question;

    // Clear and create options
    optionsEl.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];

    question.options.forEach((option, index) => {
        const optionEl = document.createElement('button');
        optionEl.className = 'option';
        optionEl.innerHTML = `
            <span class="option-letter">${letters[index]}</span>
            <span class="option-text">${option}</span>
            <span class="option-icon"></span>
        `;
        optionEl.addEventListener('click', () => selectOption(index, optionEl));
        optionsEl.appendChild(optionEl);
    });

    // Start timer
    startTimer();
}

// Start Timer
function startTimer() {
    timeLeft = 15;
    timerTextEl.textContent = timeLeft;
    timerProgressEl.style.strokeDashoffset = '0';
    timerProgressEl.classList.remove('warning', 'danger');

    const circumference = 283; // 2 * PI * 45

    timer = setInterval(() => {
        timeLeft--;
        timerTextEl.textContent = timeLeft;

        // Update circle progress
        const offset = circumference * (1 - timeLeft / 15);
        timerProgressEl.style.strokeDashoffset = offset;

        // Color warnings
        if (timeLeft <= 5) {
            timerProgressEl.classList.add('danger');
        } else if (timeLeft <= 10) {
            timerProgressEl.classList.add('warning');
        }

        // Time's up
        if (timeLeft <= 0) {
            clearInterval(timer);
            timeUp();
        }
    }, 1000);
}

// Stop Timer
function stopTimer() {
    clearInterval(timer);
}

// Time's Up
function timeUp() {
    if (answered) return;
    answered = true;

    const options = document.querySelectorAll('.option');
    const correctIndex = questions[currentQuestionIndex].correct;

    // Disable all options
    options.forEach((opt, idx) => {
        opt.classList.add('disabled');
        if (idx === correctIndex) {
            opt.classList.add('correct');
            opt.querySelector('.option-icon').textContent = '✓';
        }
    });

    nextBtn.disabled = false;
}

// Select Option
function selectOption(index, optionEl) {
    if (answered) return;
    answered = true;
    stopTimer();

    const question = questions[currentQuestionIndex];
    const options = document.querySelectorAll('.option');
    const isCorrect = index === question.correct;

    // Disable all options
    options.forEach(opt => opt.classList.add('disabled'));

    // Mark selected
    optionEl.classList.add('selected');

    if (isCorrect) {
        score++;
        optionEl.classList.add('correct');
        optionEl.querySelector('.option-icon').textContent = '✓';
    } else {
        optionEl.classList.add('incorrect');
        optionEl.querySelector('.option-icon').textContent = '✗';
        // Show correct answer
        options[question.correct].classList.add('correct');
        options[question.correct].querySelector('.option-icon').textContent = '✓';
    }

    nextBtn.disabled = false;
}

// Next Question
function nextQuestion() {
    currentQuestionIndex++;

    if (currentQuestionIndex >= 10) {
        showResult();
    } else {
        loadQuestion();
    }
}

// Show Result
function showResult() {
    stopTimer();
    switchScreen(quizScreen, resultScreen);

    // Calculate results
    const percentage = Math.round((score / 10) * 100);
    const incorrect = 10 - score;

    // Update UI
    finalScoreEl.textContent = score;
    resultPercentageEl.textContent = `${percentage}%`;
    correctCountEl.textContent = score;
    incorrectCountEl.textContent = incorrect;

    // Performance message
    let icon, message;
    if (percentage >= 90) {
        icon = '🏆';
        message = 'Outstanding! You\'re a genius!';
    } else if (percentage >= 70) {
        icon = '🌟';
        message = 'Excellent work! Great knowledge!';
    } else if (percentage >= 50) {
        icon = '👍';
        message = 'Good job! Keep learning!';
    } else if (percentage >= 30) {
        icon = '📚';
        message = 'Not bad! Practice makes perfect!';
    } else {
        icon = '💪';
        message = 'Don\'t give up! Try again!';
    }

    resultIconEl.textContent = icon;
    resultMessageEl.textContent = message;

    // Save high score
    const highScore = localStorage.getItem('quizHighScore') || 0;
    if (score > highScore) {
        localStorage.setItem('quizHighScore', score);
    }
}

// Restart Quiz
function restartQuiz() {
    switchScreen(resultScreen, startScreen);
    displayHighScore();
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', init);