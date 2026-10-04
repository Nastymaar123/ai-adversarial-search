/*
Author: Maar Drew-Joseph
Major: Information Technology
Creation Date: 10/03/2026
Due Date: 10/12/2026
Course: CPSC 447
Professor: Dr. Schwesinger
Assignment: Project 3 - Adversarial Search
File: game.js
Purpose: handles the game state, board representation, legal moves and winning conditions for the adversarial search game.
*/

'use strict';

function parseState(input) {
    // Implement the logic to parse the input string into the game state representation

const parts = input.trim().split(/\s+/);

const player = parts[0];

const blackPieces = parts.slice(1, 6).map(Number);
const redPieces = parts.slice(6, 11).map(Number);

blackPieces.sort((a, b) => a - b);
redPieces.sort((a, b) => a - b);

return {
    player,
    blackPieces,
    redPieces
};


}

function positionToRowCol(position) {
   
    const index = position - 1; 
   
    const row = Math.floor(index / 6);
    const col = index % 6;
    return { row, col };
}


function rowColToPosition(row, col) {
    return row * 6 + col + 1;
}

function ValidatePosition(row, col) {
    return row >= 0 && row < 6 && col >= 0 && col < 6;
}


function OccupiedPosition(state) {
 
    const occupied = new Set();

    for (const pos of state.blackPieces) {
        if (pos !== 0){
            occupied.add(pos);
        }
    }

    for (const pos of state.redPieces) {
       if (pos !== 0){
        occupied.add(pos);
       }
    }

    return occupied;
}

function DropPhase(state) {

    if (state.blackPieces.includes(0)) {
        return true;
    }
    
    if (state.redPieces.includes(0)) {
        return true;
    }
    return false;
}

function LegalMoves(state) {

    const moves = [];
    const occupied = OccupiedPosition(state);

    // Drop Phase
    if (DropPhase(state)) {

        for (let position = 1; position <= 36; position++) {

            if (!occupied.has(position)) {
                moves.push([0, position]);
            }
        }

        return moves;
    }

    // Slide Phase
    const pieces = state.player === 'B'
        ? state.blackPieces
        : state.redPieces;

    const directions = [
        { row: -1, col: -1 }, // Up Left
        { row: -1, col: 0 },  // Up
        { row: -1, col: 1 },  // Up Right
        { row: 0, col: -1 },  // Left
        { row: 0, col: 1 },   // Right
        { row: 1, col: -1 },  // Down Left
        { row: 1, col: 0 },   // Down
        { row: 1, col: 1 }    // Down Right
    ];

    for (const position of pieces) {

        const { row, col } = positionToRowCol(position);

        for (const direction of directions) {

            const newRow = row + direction.row;
            const newCol = col + direction.col;

            if (ValidatePosition(newRow, newCol)) {

                const newPosition =
                    rowColToPosition(newRow, newCol);

                if (!occupied.has(newPosition)) {
                    moves.push([position, newPosition]);
                }
            }
        }
    }

    moves.sort((a, b) => {

        if (a[0] !== b[0]) {
            return a[0] - b[0];
        }

        return a[1] - b[1];
    });

    return moves;
}

function FourLineWin(pieces) {

    const pieceSet = new Set(pieces.filter(pos => pos !== 0));

    const directions = [
        { row: 0, col: 1 },  // Horizontal
        { row: 1, col: 0 },  // Vertical
        { row: 1, col: 1 },  // Diagonal Down-Right
        { row: 1, col: -1 }  // Diagonal Down-Left
    ];

    for (const position of pieceSet) {

        const { row, col } = positionToRowCol(position);

        for (const direction of directions) {
            

            let count = 1;
            let newRow = row;
            let newCol = col;

            for (let i = 0; i < 3; i++) {
                newRow += direction.row;
                newCol += direction.col;

                if (!ValidatePosition(newRow, newCol)) {
                    break;
                }

                const newPosition = rowColToPosition(newRow, newCol);

                if (pieceSet.has(newPosition)) {
                    count++;
                } else {
                    break;
                }
            }

            if (count === 4) {
                return true;
            }
        }
    }

    return false;
}


function FourSquareWins(pieces) {

    const pieceSet = new Set(pieces.filter(pos => pos !== 0));

    for (const position of pieceSet) {

        const { row, col } = positionToRowCol(position);

        const squarePositions = [
            rowColToPosition(row, col),
            rowColToPosition(row, col + 1),
            rowColToPosition(row + 1, col),
            rowColToPosition(row + 1, col + 1)
        ];

        if (squarePositions.every(pos => pieceSet.has(pos))) {
            return true;
        }
    }

    return false;
}

function TiltedSquareWins(pieces) {

    const pieceSet = new Set(pieces.filter(pos => pos !== 0));

    for (let row =1; row < 5; row++) {
        for (let col = 1; col < 5; col++) {
            
            const squarePositions = [
                rowColToPosition(row - 1, col), // Top
                rowColToPosition(row, col + 1), // Right
                rowColToPosition(row + 1, col), // Bottom
                rowColToPosition(row, col - 1) // Left
            ];

            if (squarePositions.every(pos => pieceSet.has(pos))) {
                return true;
            }
        }
    }

    return false;
}


function CheckWins(pieces) {

    if (FourLineWin(pieces)) {
        return true;
    }

    if (FourSquareWins(pieces)) {
        return true;
    }

    if (TiltedSquareWins(pieces)) {
        return true;
    }

    return false;
}


function ApplyMove(state, move) {

    const from = move[0];
    const to = move[1];

    const newState = {
        
        player: state.player,
        blackPieces: [...state.blackPieces],
        redPieces: [...state.redPieces]

    };

    const pieces = newState.player === 'B' ? newState.blackPieces : newState.redPieces;

    if (from === 0) {

        const fromIndex = pieces.indexOf(from);
        if (fromIndex !== -1) {
            pieces[fromIndex] = to;
        }
    }

    else {
        const fromIndex = pieces.indexOf(from);
        if (fromIndex !== -1) {
            pieces[fromIndex] = to;
        }
    }

    pieces.sort((a, b) => a - b);

    newState.player = newState.player === 'B' ? 'R' : 'B';

    return newState;
}

function StateKey(state) {

    const black = [...state.blackPieces].sort((a, b) => a - b).join(',');

    const red = [...state.redPieces].sort((a, b) => a - b).join(',');

    return `${state.player}|${black}|${red}`;
}

const stateKeyTest = parseState("B 5 2 1 4 3 11 9 7 10 8");

console.log(StateKey(stateKeyTest));