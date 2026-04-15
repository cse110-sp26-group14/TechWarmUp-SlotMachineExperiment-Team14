/**
 * script.js
 *
 * This script powers an AI Token Slot Machine game.
 * Players can spin reels to win or lose AI tokens, adjust their bet,
 * and reset the game if they run out of tokens.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const tokensDisplay = document.getElementById('tokens'); // Displays current AI tokens
    const betAmountDisplay = document.getElementById('bet-amount'); // Displays current bet amount
    const spinButton = document.getElementById('spin-button'); // Button to initiate a spin
    const betDecreaseButton = document.getElementById('bet-decrease'); // Button to decrease bet
    const betIncreaseButton = document.getElementById('bet-increase'); // Button to increase bet
    const resetButton = document.getElementById('reset-button'); // Button to reset the game
    const gameMessage = document.getElementById('game-message'); // Displays game status messages
    const comicalLineDisplay = document.getElementById('comical-line'); // Displays comical lines after each spin
    const reels = [
        document.getElementById('reel1'),
        document.getElementById('reel2'),
        document.getElementById('reel3')
    ]; // Array of reel DOM elements

    // --- Game State Variables ---
    let tokens = 100; // Starting number of AI tokens
    let betAmount = 10; // Current bet amount
    const minBet = 5; // Minimum allowed bet
    const maxBet = 50; // Maximum allowed bet
    const betIncrement = 5; // Amount by which bet increases/decreases

    // --- Game Configuration: Symbols and Comical Lines ---
    const symbols = [
        { char: '🤖', name: 'Robot', value: 10 },
        { char: '🧠', name: 'Brain', value: 10 },
        { char: '💾', name: 'Disk', value: 10 },
        { char: '💻', name: 'Computer', value: 10 },
        { char: '💡', name: 'Idea', value: 15 },
        { char: '⚡', name: 'Power', value: 15 },
        { char: '📊', name: 'Data', value: 20 },
        { char: '⚙️', name: 'Gear', value: 20 },
        { char: '✨', name: 'Innovation', value: 25 }
    ]; // AI-themed symbols with their names and base values

    const comicalLines = [
        "My AI said this was a good bet. It lied.",
        "Error 404: Wins not found.",
        "Processing... Just kidding, you lost.",
        "Even AI makes mistakes. Mostly when you're betting.",
        "Your tokens have been assimilated.",
        "The algorithms are not in your favor today.",
        "Insufficient data for a win. Try again!",
        "My circuits are crying for your tokens.",
        "Beep boop, that's a no-win loop!",
        "Calculating optimal loss... success!",
        "Don't worry, your data contributes to my learning model. (And your losses too.)"
    ]; // Array of comical messages

    // --- Initialization ---
    updateDisplay(); // Update token and bet displays
    initializeReels(); // Set initial random symbols on reels
    checkGameStatus(); // Check if the game should be reset initially

    /**
     * Updates the displayed token count and bet amount on the UI.
     */
    function updateDisplay() {
        tokensDisplay.textContent = tokens;
        betAmountDisplay.textContent = betAmount;
    }

    /**
     * Retrieves the character representation of a given symbol object.
     * @param {object} symbol - The symbol object (e.g., { char: '🤖', ... }).
     * @returns {string} The character string of the symbol.
     */
    function getSymbolChar(symbol) {
        return symbol.char;
    }

    /**
     * Initializes each reel with a random symbol.
     */
    function initializeReels() {
        reels.forEach(reel => {
            reel.textContent = getSymbolChar(symbols[Math.floor(Math.random() * symbols.length)]);
        });
    }

    /**
     * Displays a message to the user in the game message area.
     * @param {string} message - The message to display.
     * @param {boolean} [isError=false] - True if the message is an error, changes text color.
     */
    function showMessage(message, isError = false) {
        gameMessage.textContent = message;
        gameMessage.style.color = isError ? '#dc3545' : '#28a745';
    }

    /**
     * Displays a random comical line in the dedicated comical line area.
     */
    function showComicalLine() {
        const randomIndex = Math.floor(Math.random() * comicalLines.length);
        comicalLineDisplay.textContent = comicalLines[randomIndex];
    }

    /**
     * Manages the state of game control buttons (spin, bet adjust, reset).
     * @param {boolean} enable - True to enable buttons, false to disable.
     */
    function setControlsEnabled(enable) {
        spinButton.disabled = !enable;
        betDecreaseButton.disabled = !enable;
        betIncreaseButton.disabled = !enable;
        // Reset button visibility is handled separately by checkGameStatus
    }

    /**
     * Checks the current game status, specifically if tokens have run out,
     * and toggles the visibility and state of the reset button accordingly.
     */
    function checkGameStatus() {
        if (tokens <= 0) {
            showMessage("AI Tokens depleted! Game Over.", true);
            setControlsEnabled(false); // Disable spin and bet buttons
            resetButton.style.display = 'block'; // Show reset button
            comicalLineDisplay.textContent = ""; // Clear comical line
        } else {
            setControlsEnabled(true); // Ensure buttons are enabled if tokens > 0
            resetButton.style.display = 'none'; // Hide reset button
        }
    }

    /**
     * Resets the game to its initial state.
     * Sets tokens to 100, bet to 10, re-initializes reels, and hides the reset button.
     */
    function resetGame() {
        tokens = 100;
        betAmount = 10;
        updateDisplay();
        initializeReels();
        showMessage("Ready to challenge the AI?");
        comicalLineDisplay.textContent = "";
        checkGameStatus(); // Re-enable controls and hide reset button
    }

    /**
     * Initiates a single reel spin animation and determines its final symbol.
     * @param {HTMLElement} reel - The DOM element of the reel to spin.
     * @param {number} duration - The total duration of the spin animation for this reel in ms.
     * @returns {Promise<object>} A promise that resolves with the final chosen symbol object.
     */
    async function spinSingleReel(reel, duration) {
        return new Promise(resolve => {
            // Prepare for animation: add spinning class and generate content
            reel.classList.add('spinning');
            let spinContent = '';
            for (let i = 0; i < 30; i++) { // Generate enough random symbols for the animation
                spinContent += getSymbolChar(symbols[Math.floor(Math.random() * symbols.length)]);
            }
            reel.setAttribute('data-spin-content', spinContent);
            reel.innerHTML = ''; // Clear current symbol to show animation

            setTimeout(() => {
                reel.classList.remove('spinning');
                const chosenSymbol = symbols[Math.floor(Math.random() * symbols.length)];
                reel.textContent = getSymbolChar(chosenSymbol); // Set the final symbol
                resolve(chosenSymbol);
            }, duration);
        });
    }

    /**
     * Main spin function: handles game logic, animations, and win/loss determination.
     */
    async function spin() {
        if (tokens < betAmount) {
            showMessage("Insufficient AI Tokens for this bet!", true);
            return;
        }

        tokens -= betAmount; // Deduct bet from tokens
        updateDisplay(); // Update display immediately
        setControlsEnabled(false); // Disable controls during spin
        showMessage("AI is thinking... analyzing probabilities!"); // Spinning message
        comicalLineDisplay.textContent = ""; // Clear previous comical line

        const finalSymbols = [];
        const reelSpinDuration = 1000; // Duration for each reel to spin
        const reelStopDelay = 300; // Delay between each reel stopping

        // Spin each reel sequentially with a delay
        for (let i = 0; i < reels.length; i++) {
            // Await each reel spin to complete before starting the next
            finalSymbols[i] = await spinSingleReel(reels[i], reelSpinDuration);
            if (i < reels.length - 1) { // Add delay only between reels
                await new Promise(r => setTimeout(r, reelStopDelay));
            }
        }

        // --- Determine Win/Loss ---
        let winAmount = 0;
        const s1 = finalSymbols[0];
        const s2 = finalSymbols[1];
        const s3 = finalSymbols[2];

        // Check for triple match
        if (s1.char === s2.char && s2.char === s3.char) {
            if (s1.char === '✨') { // Special jackpot for 'Innovation'
                winAmount = betAmount * 50; // High payout for jackpot
                showMessage(`🌟✨🌟 AGI Jackpot! Triple Innovation! You won ${winAmount} AI Tokens!`);
            } else {
                winAmount = betAmount * (s1.value / betIncrement); // General triple match payout
                showMessage(`🎉 Triple ${s1.name}! You won ${winAmount} AI Tokens!`);
            }
        }
        // Check for double match
        else if (s1.char === s2.char || s2.char === s3.char || s1.char === s3.char) {
            let matchedSymbol;
            if (s1.char === s2.char) matchedSymbol = s1;
            else if (s2.char === s3.char) matchedSymbol = s2;
            else matchedSymbol = s3;

            winAmount = betAmount * (matchedSymbol.value / (betIncrement * 2)); // Double match payout
            showMessage(`🥳 Double ${matchedSymbol.name}! You won ${winAmount} AI Tokens!`);
        }
        // No win
        else {
            showMessage("AI needs more data... no win this time.");
            showComicalLine(); // Display a comical line only on losses
        }

        tokens += winAmount; // Add winnings to tokens
        updateDisplay(); // Update tokens display

        checkGameStatus(); // Check if game is over or re-enable controls
    }

    /**
     * Adjusts the current bet amount within defined minimum and maximum limits.
     * @param {number} change - The amount to change the bet by (e.g., -5 or 5).
     */
    function adjustBet(change) {
        const newBet = betAmount + change;
        if (newBet >= minBet && newBet <= maxBet) {
            betAmount = newBet;
            updateDisplay();
        } else if (newBet < minBet) {
            showMessage(`Minimum bet is ${minBet} AI Tokens.`, true);
        } else {
            showMessage(`Maximum bet is ${maxBet} AI Tokens.`, true);
        }
    }

    // --- Event Listeners ---
    spinButton.addEventListener('click', spin);
    betDecreaseButton.addEventListener('click', () => adjustBet(-betIncrement));
    betIncreaseButton.addEventListener('click', () => adjustBet(betIncrement));
    resetButton.addEventListener('click', resetGame);
});
