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

// Drop Phase test
const dropInput = "B 0 0 0 0 0 0 0 0 0 0";
const dropState = parseState(dropInput);

// Slide Phase test
const slideInput = "B 1 2 3 4 5 7 8 9 10 11";
const slideState = parseState(slideInput);


// Display states
console.log("Drop state object:");
console.log(dropState);

console.log("Slide state object:");
console.log(slideState);


// Check phases
console.log("Drop state:", DropPhase(dropState));
console.log("Slide state:", DropPhase(slideState));


// Check legal moves
console.log("Legal moves for drop state:");
console.log(LegalMoves(dropState));

console.log("Legal moves for slide state:");
console.log(LegalMoves(slideState));