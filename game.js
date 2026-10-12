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

Citations:

Author: OpenAI
Title: ChatGPT
Retrieved October 03, 2026 from https://chatgpt.com/
Note: Used for assistance with debugging, and selected portions of certain code implementations.

Author: Mozilla Developer Network
Title: "Array.sort() - JavaScript."
Retrieved October 03, 2026 from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
Note: Used for reference to sort the pieces in the game state.


*/

'use strict';
//Function: parseState
//Parses the input string into the game state representation
// Parameters:
// - input: The input string representing the game state
// Returns: An object containing the current player, black pieces, and red pieces
function parseState(input) {

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

//Function: positionToRowCol
//Converts a board position to its corresponding row and column
// Parameters:
// - position: The board position (1-36)
// Returns: An object containing the row and column indices (0-5)
function positionToRowCol(position) {
   
    const index = position - 1; 
   
    const row = Math.floor(index / 6);
    const col = index % 6;
    return { row, col };
}


//Function: rowColToPosition
//Converts row and column indices to the corresponding board position
// Parameters:
// - row: The row index (0-5)
// - col: The column index (0-5)
// Returns: The board position (1-36)
function rowColToPosition(row, col) {
    return row * 6 + col + 1;
}

//Function: ValidatePosition
//Checks if the given row and column indices are within the valid board range
// Parameters:
// - row: The row index (0-5)
// - col: The column index (0-5)
// Returns: True if the position is valid, false otherwise
function ValidatePosition(row, col) {
    return row >= 0 && row < 6 && col >= 0 && col < 6;
}


//Function: OccupiedPosition
//Returns a set of all occupied positions on the board
// Parameters:
// - state: The current game state
// Returns: A set containing all occupied positions
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

//Function: DropPhase
//Checks if the game is in the drop phase
// Parameters:
// - state: The current game state
// Returns: True if the game is in the drop phase, false otherwise
function DropPhase(state) {

    if (state.blackPieces.includes(0)) {
        return true;
    }
    
    if (state.redPieces.includes(0)) {
        return true;
    }
    return false;
}

//Function: LegalMoves
//Generates all legal moves for the current player in the given game state
// Parameters:
// - state: The current game state
// Returns: An array of legal moves, where each move is represented as [fromPosition, toPosition]
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

//Function: FourLineWin
//Checks if the given set of pieces contains a four-in-a-line
// Parameters:
// - pieces: An array of positions occupied by the player's pieces
// Returns: True if there is a four-in-a-line, false otherwise
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

//Function: FourSquareWins
//Checks if the given set of pieces contains a four-in-a-square
// Parameters:
// - pieces: An array of positions occupied by the player's pieces
// Returns: True if there is a four-in-a-square, false otherwise
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

//Function: TiltedSquareWins
//Checks if the given set of pieces contains a tilted four-in-a-square
// Parameters:
// - pieces: An array of positions occupied by the player's pieces
// Returns: True if there is a tilted four-in-a-square, false otherwise
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

//Function: CheckWins
//Checks if the given set of pieces contains any winning configuration (four-in-a-line, four-in-a-square, or tilted four-in-a-square)
// Parameters:
// - pieces: An array of positions occupied by the player's pieces
// Returns: True if there is any winning configuration, false otherwise
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

//Function: ApplyMove
//Applies a move to the given game state and returns the resulting new state
// Parameters:
// - state: The current game state
// - move: The move to apply, represented as [fromPosition, toPosition]
// Returns: The new game state after applying the move

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

//Function: StateKey
//Generates a unique key representing the current game state
// Parameters:
// - state: The current game state
// Returns: A string key representing the game state

function StateKey(state) {

    const black = [...state.blackPieces].sort((a, b) => a - b).join(',');

    const red = [...state.redPieces].sort((a, b) => a - b).join(',');

    return `${state.player}|${black}|${red}`;
}


module.exports = {
    parseState,
    LegalMoves,
    ApplyMove,
    CheckWins,
    StateKey
    
};
