// Game constants
const SYMBOLS = ['🍒', '🍋', '🍊', '🔔', '⭐', '🍀'];
const INITIAL_TOKENS = 500;
const SPIN_DELAY = 100; // ms delay for "spinning" animation
const PAYOUTS = {
    '🍒': 10,
    '🍋': 15,
    '🍊': 20,
    '🔔': 50,
    '⭐': 75,
    '🍀': 100,
};
const COMICAL_LINES = [
    "Almost had it!",
    "Better luck next time!",
    "So close, yet so far.",
    "The machine is just warming up.",
    "You'll get 'em next time!",
    "Keep trying, you're due for a win!",
    "That was a practice spin, right?"
];

// DOM element references
const tokenCountSpan = document.getElementById('token-count');
const reel1 = document.getElementById('reel1');
const reel2 = document.getElementById('reel2');
const reel3 = document.getElementById('reel3');
const winLossMessage = document.getElementById('win-loss-message');
const comicalLine = document.getElementById('comical-line');
const spinButton = document.getElementById('spin-button');
const resetButton = document.getElementById('reset-button');
const betButtons = document.querySelectorAll('.bet-button');

// Game state variables
let currentTokens = INITIAL_TOKENS;
let currentBet = 10; // Default bet

/**
 * Initializes the game state and event listeners.
 * This function is called when the page loads.
 */
function initializeGame() {
    // Set initial token count and update the display
    currentTokens = INITIAL_TOKENS;
    tokenCountSpan.textContent = currentTokens;

    // Set default bet selection
    document.querySelector(`.bet-button[data-bet='${currentBet}']`).classList.add('selected');

    // Add event listeners to the buttons
    spinButton.addEventListener('click', spin);
    resetButton.addEventListener('click', resetGame);

    // Add event listeners for each bet button
    betButtons.forEach(button => {
        button.addEventListener('click', () => {
            selectBet(parseInt(button.dataset.bet));
        });
    });
}

/**
 * Sets the current bet amount and updates the UI.
 * @param {number} amount - The bet amount to set.
 */
function selectBet(amount) {
    // Set the current bet amount
    currentBet = amount;

    // Update the visual selection for the bet buttons
    betButtons.forEach(button => {
        button.classList.remove('selected');
        if (parseInt(button.dataset.bet) === amount) {
            button.classList.add('selected');
        }
    });
}

/**
 * Handles the main spin logic of the slot machine.
 */
function spin() {
    // Check if the user has enough tokens for the bet
    if (currentTokens < currentBet) {
        winLossMessage.textContent = "Not enough tokens to bet!";
        return;
    }

    // Deduct the bet amount and update the token display
    currentTokens -= currentBet;
    tokenCountSpan.textContent = currentTokens;

    // Disable the spin button to prevent multiple clicks during a spin
    spinButton.disabled = true;
    winLossMessage.textContent = "Spinning...";
    comicalLine.textContent = "";

    // Simulate the reel spinning effect with a short delay
    let spinCount = 0;
    const spinInterval = setInterval(() => {
        spinCount++;
        // Randomly change symbols to simulate spinning
        reel1.textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        reel2.textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        reel3.textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];

        // After a few "spins", stop and determine the outcome
        if (spinCount > 10) {
            clearInterval(spinInterval);
            determineOutcome();
            spinButton.disabled = false;
        }
    }, SPIN_DELAY);
}

/**
 * Determines the outcome of a spin, calculates winnings, and updates the UI.
 */
function determineOutcome() {
    // "Stop" the reels at a final random symbol
    const finalReels = [
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
    ];

    reel1.textContent = finalReels[0];
    reel2.textContent = finalReels[1];
    reel3.textContent = finalReels[2];

    // Check for a win (all three symbols are the same)
    if (finalReels[0] === finalReels[1] && finalReels[1] === finalReels[2]) {
        // Calculate the winnings
        const winningSymbol = finalReels[0];
        const payout = PAYOUTS[winningSymbol] * (currentBet / 10); // Scale payout with bet
        currentTokens += payout;
        tokenCountSpan.textContent = currentTokens;
        winLossMessage.textContent = `You won ${payout} tokens!`;
        comicalLine.textContent = "Congratulations!";
    } else {
        // Handle a loss
        winLossMessage.textContent = "You lost!";
        comicalLine.textContent = COMICAL_LINES[Math.floor(Math.random() * COMICAL_LINES.length)];
    }

    // Check if the game is over
    checkGameOver();
}

/**
 * Checks if the player has run out of tokens and ends the game if so.
 */
function checkGameOver() {
    if (currentTokens < Math.min(...betButtons.map(b => parseInt(b.dataset.bet)))) {
        winLossMessage.textContent = "Game Over! You're out of tokens.";
        spinButton.disabled = true;
        betButtons.forEach(button => button.disabled = true);
        resetButton.classList.remove('hidden');
    }
}

/**
 * Resets the game to its initial state.
 */
function resetGame() {
    // Reset token count and update display
    currentTokens = INITIAL_TOKENS;
    tokenCountSpan.textContent = currentTokens;

    // Reset messages
    winLossMessage.textContent = "Good luck!";
    comicalLine.textContent = "";

    // Re-enable buttons and hide the reset button
    spinButton.disabled = false;
    betButtons.forEach(button => button.disabled = false);
    resetButton.classList.add('hidden');
}

// Initialize the game when the script is loaded
initializeGame();
