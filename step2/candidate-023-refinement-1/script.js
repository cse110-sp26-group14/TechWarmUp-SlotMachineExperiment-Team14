document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    // This object defines the symbols used in the slot machine.
    // id: A unique identifier for the symbol.
    // emoji: The visual representation of the symbol.
    // payout: The amount won when three of these symbols match.
    // weight: Determines the frequency of the symbol appearing. A higher weight means it's more common.
    const SYMBOLS = [
        { id: 'AGI', emoji: '💎', payout: 100, weight: 1 }, // Jackpot
        { id: 'ROBOT', emoji: '🤖', payout: 20, weight: 3 },
        { id: 'BRAIN', emoji: '🧠', payout: 15, weight: 4 },
        { id: 'PLUG', emoji: '🔌', payout: 10, weight: 5 },
        { id: 'FIRE', emoji: '🔥', payout: 5, weight: 8 },
        { id: 'GHOST', emoji: '👻', payout: 2, weight: 10 }, // Hallucination
    ];

    // This array holds the comical lines displayed at the bottom of the machine after each spin.
    const COMICAL_LINES = [
        "404: Fortune not found.",
        "I'm not saying it's rigged, but I'm not not saying it.",
        "Spinning harder doesn't help. I've tried.",
        "This is my favorite way to burn through tokens.",
        "You're not addicted, you're just committed.",
        "I have a good feeling about the next one. Maybe.",
        "Let's be honest, you were going to burn those tokens anyway.",
        "Keep spinning, you're on the verge of a breakthrough... or breakdown.",
    ];

    const SYMBOL_HEIGHT = 120; // Must match CSS .reel .symbol height
    const SPIN_DURATION_MS = 500; // Base spin time
    const REEL_SPIN_DELAY_MS = 100; // Delay between each reel stopping

    // --- DOM Elements ---
    // Getting references to all the necessary HTML elements to interact with them.
    const tokenBalanceEl = document.getElementById('token-balance');
    const betAmountEl = document.getElementById('bet-amount');
    const messageEl = document.getElementById('message');
    const spinButton = document.getElementById('spin-button');
    const betUpButton = document.getElementById('bet-up');
    const betDownButton = document.getElementById('bet-down');
    const reelElements = document.querySelectorAll('.reel');
    const comicalLineEl = document.getElementById('comical-line');

    // --- Game State ---
    // These variables track the current state of the game.
    let tokens = 1000;
    let betAmount = 50;
    let isSpinning = false;

    // --- Initialization ---
    // The init function is called when the page loads to set everything up.
    const init = () => {
        updateDisplays(); // Set the initial token and bet amounts.
        reelElements.forEach(reel => {
            const container = document.createElement('div');
            container.classList.add('symbol-container');
            // Pre-populate with random symbols for the initial view.
            container.innerHTML = Array.from({ length: 3 }, () => `<div class="symbol">${getRandomSymbol().emoji}</div>`).join('');
            reel.appendChild(container);
        });

        // Add event listeners to the buttons.
        spinButton.addEventListener('click', handleSpin);
        betUpButton.addEventListener('click', () => changeBet(50));
        betDownButton.addEventListener('click', () => changeBet(-50));
    };

    // --- UI Update Functions ---
    // This function updates the token and bet displays and enables/disables buttons.
    const updateDisplays = () => {
        tokenBalanceEl.textContent = tokens;
        betAmountEl.textContent = betAmount;

        const canAffordMinBet = tokens >= 50;
        if (!canAffordMinBet) {
            spinButton.textContent = "Reset"; // If out of tokens, the button becomes a reset.
        } else {
            spinButton.textContent = "SPIN";
        }
        
        // Disable buttons during a spin or if the bet is invalid.
        spinButton.disabled = isSpinning;
        betUpButton.disabled = isSpinning || !canAffordMinBet || (betAmount + 50) > tokens;
        betDownButton.disabled = isSpinning || !canAffordMinBet || (betAmount - 50) < 50;
    };

    // This function displays a message to the user (e.g., win/lose).
    const showMessage = (text, type = 'info') => {
        messageEl.textContent = text;
        messageEl.className = `message-area ${type}`;
    };

    // --- Game Logic ---
    // This function changes the bet amount.
    const changeBet = (amount) => {
        if (isSpinning) return;
        const newBet = betAmount + amount;
        // The bet must be at least 50 and not more than the current tokens.
        if (newBet >= 50 && newBet <= tokens) {
            betAmount = newBet;
            updateDisplays();
        }
    };

    // This function resets the game to its initial state.
    const resetGame = () => {
        tokens = 1000;
        betAmount = 50;
        showMessage("Game reset! Good luck!", 'win');
        updateDisplays();
    };

    // This is the main function that handles a spin.
    const handleSpin = () => {
        if (isSpinning) return;

        // If out of tokens, the spin button becomes a reset button.
        if (tokens < 50) {
            resetGame();
            return;
        }

        if (tokens < betAmount) {
            showMessage("Not enough tokens for that bet!", 'lose');
            return;
        }

        isSpinning = true;
        tokens -= betAmount;
        updateDisplays();
        showMessage("Model is processing your query...", 'info');

        const spinPromises = Array.from(reelElements).map((reel, i) => spinReel(reel, i));

        Promise.all(spinPromises).then(results => {
            checkWin(results); // Check for a win after all reels have stopped.
            isSpinning = false;
            updateDisplays();
        });
    };

    // This function animates a single reel.
    const spinReel = (reel, index) => {
        return new Promise(resolve => {
            const container = reel.querySelector('.symbol-container');
            const finalSymbol = getRandomSymbol();
            
            // Generate a long strip of random symbols for the spin animation.
            const strip = Array.from({ length: 30 }, getRandomSymbol);
            // Place the final symbol near the end of the strip.
            strip[strip.length - 2] = finalSymbol;
            
            container.innerHTML = strip.map(s => `<div class="symbol">${s.emoji}</div>`).join('');

            // Instantly reset to the top without animation.
            container.style.transition = 'none';
            container.style.transform = 'translateY(0)';
            
            // Force a browser reflow to apply the reset.
            reel.offsetHeight; 

            // Set up the spin animation.
            const spinDuration = SPIN_DURATION_MS + (index * REEL_SPIN_DELAY_MS);
            const finalPosition = (strip.length - 2) * SYMBOL_HEIGHT;

            container.style.transition = `transform ${spinDuration / 1000}s cubic-bezier(0.25, 0.1, 0.25, 1)`;
            container.style.transform = `translateY(-${finalPosition}px)`;

            setTimeout(() => resolve(finalSymbol), spinDuration);
        });
    };

    // This function checks for a win and updates the UI accordingly.
    const checkWin = (results) => {
        const [s1, s2, s3] = results;

        // A win is when all three symbols are the same.
        if (s1.id === s2.id && s2.id === s3.id) {
            const symbol = s1;
            const winnings = symbol.payout * (betAmount / 10);
            tokens += winnings;
            const winMessages = {
                'AGI': 'AGI ACHIEVED! JACKPOT!',
                'ROBOT': 'Perfect Inference! Model is robust!',
                'BRAIN': 'Deep Learning Success!',
                'PLUG': 'Strong Connection to the Source!',
                'FIRE': 'Your model is on fire! (In a good way)',
                'GHOST': 'Successfully identified a hallucination!'
            };
            showMessage(`${winMessages[symbol.id]} +${winnings} Tokens`, 'win');
        } else {
            const loseMessages = [
                "Catastrophic Forgetting. Try again.",
                "Stuck in a Local Minimum.",
                "Encountered a Hallucination.",
                "Your prompt was too vague.",
                "Model failed to converge.",
                "Output is statistically improbable."
            ];
            const randomMsg = loseMessages[Math.floor(Math.random() * loseMessages.length)];
            showMessage(randomMsg, 'lose');
        }
        // Display a random comical line after each spin.
        comicalLineEl.textContent = COMICAL_LINES[Math.floor(Math.random() * COMICAL_LINES.length)];
        updateDisplays();
    };

    // Create a weighted pool of symbols for more realistic odds
    const weightedSymbols = SYMBOLS.flatMap(s => Array(s.weight).fill(s));
    const getRandomSymbol = () => weightedSymbols[Math.floor(Math.random() * weightedSymbols.length)];

    // Start the application
    init();
});
