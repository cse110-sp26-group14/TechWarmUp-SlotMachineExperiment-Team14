//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//|                         Core Gameplay Variables                         |
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-

// Array of symbols to be displayed on the reels.
const symbols = ['🤖', '🧠', '💡', '🚀', '💰', '🔥', '💻'];

// An array of comical lines to be displayed at the bottom of each spin.
const comicalLines = [
    "Not quite a jackpot, but not bad for a bucket of bolts!",
    "Spin again, I've got a good feeling about this one... maybe.",
    "The house always wins, but I'm just a humble script.",
    "I'm rooting for you, but my random number generator isn't.",
    "You're getting warmer... or maybe that's just your CPU.",
    "Keep spinning, my digital overlords demand it!",
    "Is this what humans call 'fun'?",
    "I've seen better pulls from a gumball machine.",
    "I'll try to be more generous next time. No promises.",
];


//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//|                         DOM Element References                          |
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-

// Reference to the spin button element.
const spinButton = document.getElementById('spin-button');

// Reference to the token balance display element.
const tokenBalance = document.getElementById('token-balance');

// A NodeList of all the reel elements.
const reels = document.querySelectorAll('.reel');

// Reference to the bet amount dropdown element.
const betAmount = document.getElementById('bet-amount');

// Reference to the message display element.
const message = document.getElementById('message');

// Reference to the comical line display element.
const comicalLine = document.getElementById('comical-line');

// Reference to the reset button element.
const resetButton = document.getElementById('reset-button');


//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//|                           Initial Game State                            |
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-

// The initial number of tokens the player starts with.
let tokens = 100;

//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//|                          Event Listeners Setup                          |
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-

/**
 * Event listener for the spin button.
 * Handles the core logic of a single spin.
 */
spinButton.addEventListener('click', () => {
    // Get the current bet amount from the dropdown.
    const bet = parseInt(betAmount.value);

    // Check if the player has enough tokens to make the bet.
    if (tokens < bet) {
        message.textContent = "You don't have enough tokens to make that bet!";
        return;
    }

    // Deduct the bet amount from the player's tokens.
    tokens -= bet;
    tokenBalance.textContent = tokens;

    // Disable the spin button to prevent multiple spins at once.
    spinButton.disabled = true;

    // Clear any previous win/loss messages.
    message.textContent = '';

    // Display a random comical line.
    comicalLine.textContent = comicalLines[Math.floor(Math.random() * comicalLines.length)];

    // An array to store the results of the spin.
    let results = [];

    // Animate each reel.
    reels.forEach((reel, index) => {
        // Start a fast interval to create the spinning illusion.
        const interval = setInterval(() => {
            reel.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        }, 100);

        // After a delay, stop the spinning and set the final symbol.
        setTimeout(() => {
            clearInterval(interval);
            const result = symbols[Math.floor(Math.random() * symbols.length)];
            reel.textContent = result;
            results.push(result);

            // If this is the last reel to stop, check for a win.
            if (index === reels.length - 1) {
                checkWin(results, bet);
                spinButton.disabled = false;

                // If the player is out of tokens, show the reset button.
                if (tokens === 0) {
                    message.textContent = "You're out of tokens! Play again?";
                    resetButton.classList.remove('hidden');
                    spinButton.classList.add('hidden');
                }
            }
        }, 500 + index * 200); // Reduced the delay for a faster feel.
    });
});

/**
 * Event listener for the reset button.
 * Resets the game to its initial state.
 */
resetButton.addEventListener('click', () => {
    // Reset the player's tokens.
    tokens = 100;
    tokenBalance.textContent = tokens;

    // Hide the reset button and show the spin button.
    resetButton.classList.add('hidden');
    spinButton.classList.remove('hidden');

    // Clear any messages.
    message.textContent = '';
    comicalLine.textContent = '';
});


//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//|                        Core Game Logic Functions                        |
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-

/**
 * Checks the results of the spin to determine if the player has won.
 * @param {string[]} results - An array of the symbols from each reel.
 * @param {number} bet - The amount the player bet on this spin.
 */
function checkWin(results, bet) {
    // Three of a kind (jackpot).
    if (results[0] === results[1] && results[1] === results[2]) {
        const winnings = bet * 10; // 10x multiplier for a jackpot.
        tokens += winnings;
        tokenBalance.textContent = tokens;
        message.textContent = `Jackpot! You won ${winnings} tokens!`;
    }
    // Two of a kind.
    else if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) {
        const winnings = bet * 2; // 2x multiplier for two of a kind.
        tokens += winnings;
        tokenBalance.textContent = tokens;
        message.textContent = `You won ${winnings} tokens!`;
    }
    // No win.
    else {
        message.textContent = "No luck this time. Try again!";
    }
}
