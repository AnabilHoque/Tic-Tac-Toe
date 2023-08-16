"use strict";

// Gameboard module
const gameBoard = (() => {
    let _arrayBoard = ["", "", "", "", "", "", "", "", ""];
    
    const getValueInBoard = (idx) => {
        if (idx < _arrayBoard.length) {
            return _arrayBoard[idx]; 
        } else {
            throw new Error("Index Error");
        }
    };
    
    const setValueInBoard = (idx, symbol) => {
        if (idx < _arrayBoard.length) {
            _arrayBoard[idx] = symbol;
        } else {
            throw new Error("Index Error");
        }
    };

    const reset = () => {
        for (let i = 0; i < _arrayBoard.length; i++) {
            _arrayBoard[i] = "";
        }
    };

    return {
        getValueInBoard,
        setValueInBoard,
        reset
    };
})();

// Player factory
const Player = (symbol) => {
    let _symbol = symbol;

    const getSymbol = () => {
        return _symbol;
    };

    return {
        getSymbol
    };
}

// gameController module
const gameController = (() => {
    const playerX = Player("X");
    const playerO = Player("O");
    let isGameFinished = false;
    let numMoves = 0;

    const getCurrentPlayerSymbol = () => {
        if (numMoves % 2 === 0) {
            playerX.getSymbol();
        } else {
            playerO.getSymbol();
        }
    };

    const playGame = (idx) => {
        gameBoard.setValueInBoard(idx, getCurrentPlayerSymbol());
        if (checkWinner(getCurrentPlayerSymbol())) {
            isGameFinished = true;
            console.log(`Winner is player ${getCurrentPlayerSymbol()}`);
        }
        if (numMoves === 9) {
            isGameFinished = true;
            console.log("Draw");
        }
        numMoves++;
    };

    const checkWinner = (symbol) => {
        let symbolIndices = [];
        for (let i = 0; i < 9; i++) {
            if (gameBoard.getValueInBoard(i) === symbol) {
                symbolIndices.push(i);
            }
        }

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
    };

    const getIsGameFinished = () => {
        return isGameFinished;
    };
})();