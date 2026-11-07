const RANDOM_QUOTE_API_URL = 'https://dummyjson.com/quotes/random';
const quoteDisplayElement = document.getElementById('quote-display');
const quoteInputElement = document.getElementById('quote-input');
const timerElement = document.getElementById('timer');
const wpmElement = document.getElementById('wpm');
const accuracyElement = document.getElementById('accuracy');
const errorsElement = document.getElementById('errors');
const resetBtn = document.getElementById('reset-btn');

let timerInterval;
let startTime;
let timeLimit = 60;
let timeLeft = timeLimit;
let isTyping = false;
let totalErrors = 0;
let totalTyped = 0;

// Fallback quotes in case API fails
const fallbackQuotes = [
    "the quick brown fox jumps over the lazy dog",
    "The only way to do great work is to love what you do.",
    "Innovation distinguishes between a leader and a follower.",
    "Stay hungry, stay foolish.",
    "Your time is limited, so don't waste it living someone else's life.",
    "The best way to predict the future is to create it.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "Believe you can and you're halfway there.",
    "It does not matter how slowly you go as long as you do not stop.",
    "Everything you've ever wanted is on the other side of fear.",
    "Hardships often prepare ordinary people for an extraordinary destiny."
];

async function getRandomQuote() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
        const response = await fetch(RANDOM_QUOTE_API_URL, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data.quote || data.content || fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
    } catch (error) {
        clearTimeout(timeoutId);
        console.warn("API failed or timed out, using fallback quote:", error);
        return fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
    }
}

async function renderNewQuote() {
    const quote = "the quick brown fox jumps over the lazy dog";
    quoteDisplayElement.innerHTML = '';
    quote.split('').forEach(character => {
        const characterSpan = document.createElement('span');
        characterSpan.innerText = character;
        quoteDisplayElement.appendChild(characterSpan);
    });
    quoteInputElement.value = null;
    resetStats();
}

function resetStats() {
    clearInterval(timerInterval);
    timeLeft = timeLimit;
    timerElement.innerText = timeLeft + 's';
    wpmElement.innerText = 0;
    accuracyElement.innerText = '0%';
    errorsElement.innerText = 0;
    isTyping = false;
    totalErrors = 0;
    totalTyped = 0;
    quoteInputElement.disabled = false;
    quoteInputElement.focus();
}

function startTimer() {
    startTime = new Date();
    timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.innerText = timeLeft + 's';
        if (timeLeft === 0) {
            finishGame();
        }
    }, 1000);
}

function finishGame() {
    clearInterval(timerInterval);
    quoteInputElement.disabled = true;
    // Final calculations if needed
}

quoteInputElement.addEventListener('input', () => {
    if (!isTyping) {
        isTyping = true;
        startTimer();
    }

    const arrayQuote = quoteDisplayElement.querySelectorAll('span');
    const arrayInput = quoteInputElement.value.split('');

    let correct = true;
    let errors = 0;

    arrayQuote.forEach((characterSpan, index) => {
        const character = arrayInput[index];
        if (character == null) {
            characterSpan.classList.remove('correct');
            characterSpan.classList.remove('incorrect');
            characterSpan.classList.remove('active');
            if (index === arrayInput.length) {
                characterSpan.classList.add('active');
            }
            correct = false;
        } else if (character === characterSpan.innerText) {
            characterSpan.classList.add('correct');
            characterSpan.classList.remove('incorrect');
            characterSpan.classList.remove('active');
        } else {
            characterSpan.classList.remove('correct');
            characterSpan.classList.add('incorrect');
            characterSpan.classList.remove('active');
            errors++;
            correct = false;
        }
    });

    totalErrors = errors;
    totalTyped = arrayInput.length;

    // Update stats
    errorsElement.innerText = totalErrors;
    
    // WPM Calculation: (Total characters / 5) / (Time elapsed in minutes)
    const timeElapsed = (timeLimit - timeLeft) / 60;
    if (timeElapsed > 0) {
        const wpm = Math.round(((totalTyped / 5) / timeElapsed));
        wpmElement.innerText = wpm > 0 ? wpm : 0;
    }

    // Accuracy Calculation
    if (totalTyped > 0) {
        const accuracy = Math.round(((totalTyped - totalErrors) / totalTyped) * 100);
        accuracyElement.innerText = (accuracy > 0 ? accuracy : 0) + '%';
    }

    if (correct && arrayInput.length === arrayQuote.length) {
        renderNewQuote();
    }
});

resetBtn.addEventListener('click', renderNewQuote);

// Initial Load
renderNewQuote();
