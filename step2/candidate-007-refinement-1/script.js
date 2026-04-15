document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const reels = document.querySelectorAll('.reel');
    const spinButton = document.getElementById('spinButton');
    const resetButton = document.getElementById('resetButton');
    const tokenCountSpan = document.getElementById('tokenCount');
    const winAmountSpan = document.getElementById('winAmount');
    const messageLog = document.getElementById('message-log');
    const comicalLine = document.getElementById('comical-line');
    const betOptions = document.querySelector('.bet-options');

    // --- Game Configuration ---
    const symbols = ['🤖', '🧠', '⚡️', '💡', '🔥', '🧑‍💻'];
    const initialTokens = 1000;
    const winMultipliers = {
        '🤖🤖🤖': 100,
        '🧠🧠🧠': 50,
        '⚡️⚡️⚡️': 30,
        '💡💡💡': 20,
        '🔥🔥🔥': 15,
        '🧑‍💻🧑‍💻🧑‍💻': 10,
    };
    const comicalLines = [
        "My dog ate my tokens.",
        "I'm not addicted, I can stop anytime.",
        "Just one more spin...",
        "The AI is just toying with you.",
        "Are you winning, son?",
        "This is better than investing in crypto.",
        "My retirement plan.",
        "I see you're a person of culture as well."
    ];

    // --- Game State ---
    let tokens = initialTokens;
    let isSpinning = false;

    // --- Functions ---

    /**
     * Updates the token count in the UI.
     * @param {number} amount - The new token amount.
     */
    function updateTokenCount(amount) {
        tokens = amount;
        tokenCountSpan.textContent = tokens;
    }

    /**
     * Displays a message in the message log.
     * @param {string} message - The message to display.
     */
    function logMessage(message) {
        messageLog.textContent = message;
    }

    /**
     * Displays a random comical line.
     */
    function showComicalLine() {
        const randomIndex = Math.floor(Math.random() * comicalLines.length);
        comicalLine.textContent = comicalLines[randomIndex];
    }

    /**
     * Handles the spinning of the reels.
     */
    function spin() {
        if (isSpinning) return;

        const betAmount = parseInt(document.querySelector('input[name="bet"]:checked').value);

        if (tokens < betAmount) {
            logMessage("Not enough tokens to spin!");
            spinButton.style.display = 'none';
            resetButton.style.display = 'block';
            return;
        }

        isSpinning = true;
        updateTokenCount(tokens - betAmount);
        winAmountSpan.textContent = 0;
        logMessage('');
        showComicalLine();
        spinButton.disabled = true;
        betOptions.style.pointerEvents = 'none'; // Disable bet selection during spin

        reels.forEach(reel => {
            reel.classList.add('spinning');
            reel.textContent = '';
        });

        let spinResult = [];
        reels.forEach((reel, index) => {
            setTimeout(() => {
                reel.classList.remove('spinning');
                const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
                reel.textContent = randomSymbol;
                spinResult[index] = randomSymbol;

                if (index === reels.length - 1) {
                    checkWin(spinResult, betAmount);
                    spinButton.disabled = false;
                    betOptions.style.pointerEvents = 'auto'; // Re-enable bet selection
                    isSpinning = false;

                    if (tokens < betAmount) {
                        logMessage("Game over! You're out of tokens.");
                        spinButton.style.display = 'none';
                        resetButton.style.display = 'block';
                    }
                }
            }, (index + 1) * 300); // Reduced delay for faster spins
        });
    }

    /**
     * Checks for a win and updates the token count.
     * @param {string[]} result - The array of symbols from the spin.
     * @param {number} betAmount - The amount of the bet.
     */
    function checkWin(result, betAmount) {
        const resultString = result.join('');
        let win = 0;

        if (winMultipliers[resultString]) {
            win = betAmount * winMultipliers[resultString];
            logMessage(`Jackpot! You won ${win} tokens!`);
        } else if (result[0] === result[1] || result[1] === result[2]) {
            win = betAmount * 2;
            logMessage(`You won ${win} tokens!`);
        } else {
            logMessage('Try again!');
        }

        if (win > 0) {
            updateTokenCount(tokens + win);
            winAmountSpan.textContent = win;
        }
    }

    /**
     * Resets the game to its initial state.
     */
    function resetGame() {
        updateTokenCount(initialTokens);
        logMessage('Welcome back! Good luck!');
        winAmountSpan.textContent = 0;
        comicalLine.textContent = '';
        spinButton.style.display = 'block';
        resetButton.style.display = 'none';
        spinButton.disabled = false;
        betOptions.style.pointerEvents = 'auto';
    }

    // --- Event Listeners ---
    spinButton.addEventListener('click', spin);
    resetButton.addEventListener('click', resetGame);

    // --- Initial Setup ---
    updateTokenCount(tokens);
});
