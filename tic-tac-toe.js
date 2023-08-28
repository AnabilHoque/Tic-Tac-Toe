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

// Display Controller Module
const DisplayController = (() => {
    const renderResultMessage = (player1, player2, winnerArgIdx) => {
        let resultModalScreen = document.querySelector(".result-modal-screen");
        const mainScreen = document.querySelector(".main-screen");
        let matchText = document.querySelector("#match-text");
        let resultMessage = document.querySelector("#result-message");
        matchText.textContent = `${player1.getName()} - ${player1.getSymbol()} vs ${player2.getName()} - ${player2.getSymbol()}`;
        if (winnerArgIdx === -1) {
            resultMessage.textContent = "It is a tie!";
        } else if (winnerArgIdx === 0 || winnerArgIdx === 1) {
            resultMessage.textContent = winnerArgIdx === 0 ? `${player1.getName()} - ${player1.getSymbol()} wins!` : `${player2.getName()} - ${player2.getSymbol()} wins!`;
        }
        resultModalScreen.style.display = "block";
        mainScreen.style.display = "none";
    };

    return {
        renderResultMessage
    };
})();

// Game Module
const Game = (() => {
    let possibleSymbols = ["X", "O"];
    let players;
    let currPlayerIdx;
    let isGameOver;

    const randomiseSymbols = () => {
        let player1Idx = Math.floor(Math.random() * 2);
        let player1Symbol = possibleSymbols[player1Idx];
        let player2Symbol = player1Symbol === "X" ? "O" : "X";
        return [player1Symbol, player2Symbol]; 
    };

    const renderTurnText = (player) => {
        const spanElems = document.querySelectorAll(".turn-text span");
        let [nameSpan, symbolSpan] = spanElems;
        nameSpan.textContent = player.getName();
        symbolSpan.textContent = player.getSymbol();
    };

    const initGame = (name1, name2, gameMode) => {
        currPlayerIdx = 0;
        isGameOver = false;
        let randomSymbols = randomiseSymbols();
        players = [Player(name1, randomSymbols[0]), Player(name2, randomSymbols[1])];
        renderTurnText(players[currPlayerIdx]);
        Gameboard.renderGameboard();
    };

    const checkWin = (gameboard) => {
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
    }

    const handleClick = (event) => {
        if (isGameOver) {
            return;
        }
        const cellID = event.target.id;
        const cellIdx = parseInt(cellID.split("-")[1]);
        if (Gameboard.getGameboard()[cellIdx] === "") {
            Gameboard.updateGameboard(cellIdx, players[currPlayerIdx].getSymbol());
            if (checkWin(Gameboard.getGameboard())) {
                DisplayController.renderResultMessage(players[0], players[1], currPlayerIdx);
                isGameOver = true;
            } else if (checkTie(Gameboard.getGameboard())) {
                DisplayController.renderResultMessage(players[0], players[1], -1);
                isGameOver = true;
            }
            currPlayerIdx = (currPlayerIdx + 1) % 2;
            renderTurnText(players[currPlayerIdx]);
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
        handleClick
    };
})();

function changeDisplayProperty(of, to) {
    of.style.display = to;
}

function run() {
    const startButton = document.querySelector(".game-settings form");
    const initialModalScreen = document.querySelector(".initial-modal-screen");
    const mainScreen = document.querySelector(".main-screen");
    startButton.addEventListener("submit", e => {
        e.preventDefault();
        const form = e.target;
        const allFormElems = form.elements;
        const username1 = allFormElems[0].value === "" ? "Player 1" : allFormElems[0].value;
        const username2 = allFormElems[1].value === "" ? "Player 2" : allFormElems[1].value;
        const gameMode = allFormElems[2].value;
        changeDisplayProperty(initialModalScreen, "none");
        changeDisplayProperty(mainScreen, "block");
        Game.initGame(username1, username2, gameMode);
    });
}

run();