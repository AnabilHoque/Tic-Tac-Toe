// indicates code should be used in "strict mode" i.e. cannot use undeclared variables
"use strict";

// Gameboard Module
const Gameboard = (() => {
    let gameboard = ["", "", "", "", "", "", "", "", ""];

    const addEventListenerToCells = () => {
        const allCells = document.querySelectorAll(".board-cell");
        allCells.forEach(cell => cell.addEventListener("click", Game.handleClick));
    };

    const renderGameboard = () => {
        let board = "";
        gameboard.forEach((value, index) => {
            board += `<div class="board-cell neon-text" id="cell-${index}">${value}</div>`;
        })
        document.querySelector(".gameboard").innerHTML = board;
        addEventListenerToCells();
    };

    const updateGameboard = (index, symbol) => {
        gameboard[index] = symbol;
        renderGameboard();
    }

    const getGameboard = () => {
        return gameboard;
    }

    return {
        renderGameboard,
        updateGameboard,
        getGameboard
    };
})();


// Player Factory
const Player = (name, symbol) => {
    const getName = () => name;
    const getSymbol = () => symbol;
    return {
        name,
        symbol,
        getName,
        getSymbol
    };
}

// Display Controller Module (also takes care of forms)
const DisplayController = (() => {
    const startButton = document.querySelector(".game-settings form");
    const initialModalScreen = document.querySelector(".initial-modal-screen");
    const mainScreen = document.querySelector(".main-screen");
    const resultModalScreen = document.querySelector(".result-modal-screen");
    const newGameButton = document.querySelector(".result-modal-screen .message button");

    const displayInit = () => {
        startButton.addEventListener("submit", processFormInformation);
        newGameButton.addEventListener("click", resetDisplayAndLogic);
    };

    const processFormInformation = (e) => {
        e.preventDefault();
        const form = e.target;
        const allFormElems = form.elements;
        const username1 = allFormElems[0].value === "" ? "Player 1" : allFormElems[0].value;
        const username2 = allFormElems[1].value === "" ? "Player 2" : allFormElems[1].value;
        let gameMode;
        for (let i = 2; i < 5; i++) {
            if (allFormElems[i].checked) {
                gameMode = allFormElems[i].value;
            }
        }
        activateMain();
        Game.initGame(username1, username2, gameMode);
        form.reset();
    }

    const resetDisplayAndLogic = () => {
        let h2ElemDisplay = document.querySelector(".turn-text");
        h2ElemDisplay.innerHTML = "It's <span></span>'s turn - <span></span>.";
        Game.restartGame();
        activateForm();
    }

    const changeDisplayProperty = (of, to) => {
        of.style.display = to;
    };

    const activateForm = () => {
        changeDisplayProperty(initialModalScreen, "block");
        changeDisplayProperty(mainScreen, "none");
        changeDisplayProperty(resultModalScreen, "none");
    }

    const activateMain = () => {
        changeDisplayProperty(initialModalScreen, "none");
        changeDisplayProperty(mainScreen, "block");
        changeDisplayProperty(resultModalScreen, "none");
    }

    const activateResult = () => {
        changeDisplayProperty(initialModalScreen, "none");
        changeDisplayProperty(mainScreen, "none");
        changeDisplayProperty(resultModalScreen, "block");
    }

    const renderResultMessage = (player1, player2, winnerArgIdx) => {
        let matchText = document.querySelector("#match-text");
        let resultMessage = document.querySelector("#result-message");
        matchText.textContent = `${player1.getName()} - ${player1.getSymbol()} vs ${player2.getName()} - ${player2.getSymbol()}`;
        if (winnerArgIdx === -1) {
            resultMessage.textContent = "It is a tie!";
        } else if (winnerArgIdx === 0 || winnerArgIdx === 1) {
            resultMessage.textContent = winnerArgIdx === 0 ? `${player1.getName()} - ${player1.getSymbol()} wins!` : `${player2.getName()} - ${player2.getSymbol()} wins!`;
        }
        activateResult();
    };

    return {
        displayInit,
        renderResultMessage
    };
})();

// Game Module
const Game = (() => {
    let players;
    let currPlayerIdx;
    let isGameOver;
    let gameType;
    let aiPlayerIdx; // used for easy AI and hard AI, keeps track of the index at which the player is in
    const winConditions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    const initGame = (name1, name2, gameMode) => {
        currPlayerIdx = 0;
        isGameOver = false;
        gameType = gameMode;
        if (gameType == "hvAIeasy" || gameType == "hvAIhard") {
            name2 = name2 + " AI";
        }
        players = randomisePlayers(name1, name2); // i.e., who starts and what symbol they start with is random
        if (gameType == "hvAIeasy" || gameType == "hvAIhard") {
            // find which index corresponds to AI player
            if (players[0].getName().endsWith("AI")) {
                aiPlayerIdx = 0;
            } else {
                aiPlayerIdx = 1;
            }
        }
        renderTurnText(players[currPlayerIdx]);
        Gameboard.renderGameboard();
        if (aiPlayerIdx === 0) {
            if (gameType === "hvAIeasy") {
                handleEasyAI();
            } else {
                handleHardAI();
            }
        }
    };

    const randomisePlayers = (name1, name2) => {
        let possibleSymbols = ["X", "O"];
        let names = [name1, name2];
        let randomSymbo1Idx = Math.floor(Math.random() * 2);
        let randomName1Idx = Math.floor(Math.random() * 2);
        let randomSymbo2Idx = (randomSymbo1Idx + 1) % 2;
        let randomName2Idx = (randomName1Idx + 1) % 2;
        return [Player(names[randomName1Idx], possibleSymbols[randomSymbo1Idx]), Player(names[randomName2Idx], possibleSymbols[randomSymbo2Idx])];
    }

    const renderTurnText = (player) => {
        if (isGameOver) {
            return;
        }
        const spanElems = document.querySelectorAll(".turn-text span");
        let [nameSpan, symbolSpan] = spanElems;
        nameSpan.textContent = player.getName();
        symbolSpan.textContent = player.getSymbol();
    };

    const checkWin = (gameboard) => {
        for (let i = 0; i < winConditions.length; i++) {
            let [x, y, z] = winConditions[i];
            if (gameboard[x] && gameboard[x] === gameboard[y] && gameboard[y] === gameboard[z]) {
                return true;
            }
        }
        return false;
    };

    const checkTie = (gameboard) => {
        return gameboard.every(cell => cell !== "");
    };
    
    const getAvailable = () => {
        let available = [];
        for (let i = 0; i < 9; i++) {
            if (Gameboard.getGameboard()[i] === "") {
                available.push(i);
            }
        }
        return available;
    };

    const handleEasyAI = () => {
        let available = getAvailable();
        let choice = available[Math.floor(Math.random() * available.length)];
        Gameboard.updateGameboard(choice, players[aiPlayerIdx].getSymbol());
        if (checkGameEnded()) {
            return;
        }
        currPlayerIdx = (currPlayerIdx + 1) % 2;
        renderTurnText(players[currPlayerIdx]);
    };

    const handleHardAI = () => {
        // We apply the Minmax Algorithm, assumes player 1 will play optimally
        // player 2 (AI) is the maximising player, index 1
        // player 1 (Human) is the minimising player, index 0
        let bestScore = -Infinity;
        let gameboardCopy = [...Gameboard.getGameboard()];
        let bestMove;
        for (let i = 0; i < 9; i++) {
            if (gameboardCopy[i] === "") {
                gameboardCopy[i] = players[aiPlayerIdx].getSymbol();
                let score = minmax(gameboardCopy, 0, false);
                gameboardCopy[i] = "";
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        Gameboard.updateGameboard(bestMove, players[aiPlayerIdx].getSymbol());
        if (checkGameEnded()) {
            return;
        }
        currPlayerIdx = (currPlayerIdx + 1) % 2;
        renderTurnText(players[currPlayerIdx]);
    };

    const checkResult = (board) => {
        // check result with respect to ai player i.e., player 2
        let aiSymbol = players[aiPlayerIdx].getSymbol();
        let humanSymbol = players[(aiPlayerIdx + 1) % 2].getSymbol();
        for (let i = 0; i < winConditions.length; i++) {
            let [x, y, z] = winConditions[i];
            if (board[x] === aiSymbol && board[x] === board[y] && board[y] === board[z]) {
                // AI wins -> score = 1
                return 1;
            }
            if (board[x] === humanSymbol && board[x] === board[y] && board[y] === board[z]) {
                // AI loses -> -1
                return -1;
            }
        }
        // Tie -> score = 0
        if (checkTie(board)) {
            return 0;
        }
        // No result
        return null;
    };

    const minmax = (board, depth, isMaximising) => {
        let result = checkResult(board);
        if (result !== null) {
            return result;
        }

        if (isMaximising) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                // Is cell available?
                if (board[i] === "") {
                    board[i] = players[aiPlayerIdx].getSymbol();
                    let score = minmax(board, depth+1, false);
                    board[i] = "";
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            // Minimising player
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                // Is cell available?
                if (board[i] === "") {
                    board[i] = players[(aiPlayerIdx + 1) % 2].getSymbol();
                    let score = minmax(board, depth+1, true);
                    board[i] = "";
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    };

    const checkGameEnded = () => {
        if (checkWin(Gameboard.getGameboard())) {
            isGameOver = true;
            let h2ElemDisplay = document.querySelector(".turn-text");
            h2ElemDisplay.innerHTML = `Game Finished! Winner is ${players[currPlayerIdx].getName()} - ${players[currPlayerIdx].getSymbol()}!`;
            setTimeout(() => {
                DisplayController.renderResultMessage(players[0], players[1], currPlayerIdx);
            }, 2500);
            return true;
        } else if (checkTie(Gameboard.getGameboard())) {
            isGameOver = true;
            let h2ElemDisplay = document.querySelector(".turn-text");
            h2ElemDisplay.innerHTML = "Game Finished! It's a tie!";
            setTimeout(() => {
                DisplayController.renderResultMessage(players[0], players[1], -1);
            }, 2500);
            return true;
        }
        return false;
    };

    const handleClick = (event) => {
        if (isGameOver) {
            return;
        }

        const cellID = event.target.id;
        const cellIdx = parseInt(cellID.split("-")[1]);
        if (Gameboard.getGameboard()[cellIdx] === "") {
            Gameboard.updateGameboard(cellIdx, players[currPlayerIdx].getSymbol());
            if (checkGameEnded()) {
                return;
            };
            currPlayerIdx = (currPlayerIdx + 1) % 2;
            renderTurnText(players[currPlayerIdx]);
        }
        if (!isGameOver && (gameType === "hvAIeasy" || gameType === "hvAIhard") && currPlayerIdx === aiPlayerIdx) {
            if (gameType == "hvAIeasy") {
                handleEasyAI();
            } else {
                handleHardAI();
            }
        }
    };

    const restartGame = () => {
        for (let i = 0; i < 9; i++) {
            Gameboard.updateGameboard(i, "");
        }
        Gameboard.renderGameboard();
    };

    return {
        initGame,
        handleClick,
        restartGame
    };
})();

function run() {
    DisplayController.displayInit();
}

run();