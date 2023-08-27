// indicates code should be used in "strict mode" i.e. cannot use undeclared variables
"use strict";

const Gameboard = (() => {
    let gameboard = ["", "", "", "", "", "", "", "", ""];

    const displayGameboard = () => {
        let board = "";
        gameboard.forEach((value, index) => {
            board += `<div class="board-cell" id="cell-${index}">${value}</div>`;
        })
        document.querySelector(".gameboard").innerHTML = board;
    }

    return {
        displayGameboard
    }
})();

const Player = (name, symbol) => {
    return {
        name,
        symbol
    }
}

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

    const initGame = (name1, name2, gameMode) => {
        let randomSymbols = randomiseSymbols();
        players = [Player(name1, randomSymbols[0]), Player(name2, randomSymbols[1])];
        currPlayerIdx = 0;
        isGameOver = false;
        Gameboard.displayGameboard();
    };

    return {
        initGame
    }
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