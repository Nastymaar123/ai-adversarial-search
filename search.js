
/*
Author: Maar Drew-Joseph
Major: Information Technology
Creation Date: 10/04/2026
Due Date: 10/12/2026
Course: CPSC 447
Professor: Dr. Schwesinger
Assignment: Project 3 - Adversarial Search
File: search.js
Purpose: implements the adversarial search algorithms for the game, including minimax and alpha-beta pruning.

Citations:

Author: OpenAI
Title: ChatGPT
Retrieved October 04, 2026 from https://chatgpt.com/
Note: Used for assistance with debugging, and selected portions of certain code implementations.

Author: Mozilla Developer Network
Title: "Array.prototype.filter() - JavaScript."
Retrieved October 04, 2026 from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
Note: Used for reference to filter unplaced pieces in the game state.

*/

"use strict";

// Import necessary functions from the game module and the readline module for user input.
const { parseState, LegalMoves, ApplyMove, CheckWins, StateKey } = require("./game");
const readline = require("readline");

// Variables to track search metrics during adversarial search.
let nodesEvaluated = 0;
let maxDepthReached = 0;
let moveScore = 0;

// Function: ResetSearchMetrics
// Resets the search metrics (nodes evaluated, max depth reached, and move score) to their initial values.
function ResetSearchMetrics() {
    nodesEvaluated = 0;
    maxDepthReached = 0;
    moveScore = 0;
}

// Function: ShapePotential
// Evaluates the potential of the given set of pieces to form advantageous shapes on the board.
// Parameters:
// - pieces: An array of positions occupied by the player's pieces
// Returns: A numerical score representing the shape potential of the pieces.
function ShapePotential(pieces) {

    const placePieces = pieces.filter(pos => pos !== 0); // Filter out unplaced pieces

    let score = 0; // Initialize the shape potential score

    // Evaluate all pairs of placed pieces to calculate the shape potential score
    for (let i = 0; i < placePieces.length; i++) {

        const first = placePieces[i];
        const firstRow = Math.floor((first - 1) / 6);
        const firstCol = (first - 1) % 6;

        // Compare the first piece with all subsequent pieces to evaluate potential shapes
        for (let j = i + 1; j < placePieces.length; j++) {
            const second = placePieces[j];
            const secondRow = Math.floor((second - 1) / 6);
            const secondCol = (second - 1) % 6;

            if (firstRow === secondRow) {
                score += 1; // Reward pieces in the same row
            }

            if (firstCol === secondCol) {
                score += 1; // Reward pieces in the same column
            }

            if (Math.abs(firstRow - secondRow) === 1 && Math.abs(firstCol - secondCol) === 1) {
                score += 2; // Reward diagonally adjacent pieces
            }

            if (Math.abs(firstRow - secondRow) === 2 && firstCol === secondCol) {
                score += 2; // Reward vertically aligned pieces with a gap of 2
            }
            
            if (Math.abs(firstCol - secondCol) === 2 && firstRow === secondRow) {
                score += 2; // Reward horizontally aligned pieces with a gap of 2
            }

            
        }
    }

    return score; // Return the calculated shape potential score
}

// Function: ForkPotential
// Evaluates the potential of the given set of pieces to create forks (multiple threats) on the board.
// Parameters:
// - pieces: An array of positions occupied by the player's pieces
// Returns: A numerical score representing the fork potential of the pieces.

function ForkPotential(pieces) {

    
    const placePieces = pieces.filter(pos => pos !== 0); // Filter out unplaced pieces

    let horizontalForks = 0; // Count of potential horizontal forks
    let verticalForks = 0;   // Count of potential vertical forks
    let diagonalForks = 0;   // Count of potential diagonal forks

    // Evaluate all pairs of placed pieces to identify potential forks
    for (let i = 0; i < placePieces.length; i++) {
        
        const first = placePieces[i];
        const firstRow = Math.floor((first - 1) / 6);
        const firstCol = (first - 1) % 6;

        // Compare the first piece with all subsequent pieces to evaluate potential forks
        for (let j = i + 1; j < placePieces.length; j++) {
            const second = placePieces[j];
            const secondRow = Math.floor((second - 1) / 6);
            const secondCol = (second - 1) % 6;

            // Check for potential horizontal, vertical, and diagonal forks between the first and second pieces
            if (firstRow === secondRow) {
                horizontalForks += 1;
            }
            // Check for potential vertical forks
            if (firstCol === secondCol) {
                verticalForks += 1;
            }
            // Check for potential diagonal forks
            if (Math.abs(firstRow - secondRow) === 1 && Math.abs(firstCol - secondCol) === 1) {
                diagonalForks += 1;
            }
        }
    }

    let threats = 0; // Initialize the total number of fork threats

    if(horizontalForks > 0) { // Add horizontal fork threats to the total
        threats += horizontalForks;
    }
    
    if(verticalForks > 0) { // Add vertical fork threats to the total
        threats += verticalForks;
    }
    
    if(diagonalForks > 0) { // Add diagonal fork threats to the total
        threats += diagonalForks;
    }

    if (threats > 2) {
        return 15; // Return a high score if there are more than 2 fork threats
    }
    
    return 0; // No significant fork threats detected, return a low score
}
        
// Function: Evaluate
// Evaluates the current game state and returns a numerical score representing the advantage for the black player.
// Parameters:
// - state: The current game state
// Returns: A numerical score, positive if black is favored, negative if red is favored.

function Evaluate(state) {

    nodesEvaluated++;

    if (CheckWins(state.blackPieces)) {
        return 10000; // Black wins
    }
    if (CheckWins(state.redPieces)) {
        return -10000; // Red wins
    }

    let score = 0; // Initialize the evaluation score for the current game state

    const centerPositions = [15, 16, 21, 22]; // Define the central positions on the board
    
    for (const pos of state.blackPieces) {
        if (centerPositions.includes(pos)) {
            score += 10; // Reward black pieces in the center
        }
    }
    for (const pos of state.redPieces) {
        if (centerPositions.includes(pos)) {
            score -= 10; // Penalize red pieces in the center
        }
    }
 
    // Evaluate the shape potential and fork potential for both black and red pieces
    score += ShapePotential(state.blackPieces);
    score -= ShapePotential(state.redPieces);
    
    // Evaluate the fork potential for both black and red pieces
    score += ForkPotential(state.blackPieces);
    score -= ForkPotential(state.redPieces);

    return score; // Return the final evaluation score for the current game state

}

// Function: Minimax
// Implements the Minimax algorithm to determine the optimal move for the current player.
// Parameters:
// - state: The current game state
// - depth: The current depth in the search tree
// - MaxDepth: The maximum depth to search
// - maximizingPlayer: True if the current player is the maximizing player (black), false otherwise
// Returns: The evaluated score of the best move for the current player

function Minimax(state, depth, MaxDepth, maximizingPlayer) {

    maxDepthReached = Math.max(maxDepthReached, depth); // Update the maximum depth reached so far
    
    // Check if the maximum search depth has been reached
    if (depth >= MaxDepth) {
        if (depth > maxDepthReached) {
            maxDepthReached = depth;
        }
        return Evaluate(state);
    }

    // Check if the current game state is a terminal state (win for either player)
    if (CheckWins(state.blackPieces) || CheckWins(state.redPieces)) {
        return Evaluate(state);
    }

    // Generate all legal moves for the current game state
    const moves = LegalMoves(state);
    if (moves.length === 0) {
        return Evaluate(state);
    }

    // Evaluate the best move for the current player using the Minimax algorithm
    if (maximizingPlayer) {
        let bestScore = -Infinity;
        for (const move of moves) {
            const newState = ApplyMove(state, move);

            const score = Minimax(newState, depth + 1, MaxDepth, false);
            bestScore = Math.max(bestScore, score);
        }
        return bestScore; // Return the best score for the maximizing player
    
    } else {
        let bestScore = Infinity;
        for (const move of moves) {
            const newState = ApplyMove(state, move);
            const score = Minimax(newState, depth + 1, MaxDepth, true);
            bestScore = Math.min(bestScore, score);
        }
        return bestScore; // Return the best score for the minimizing player
    }

}

// Function: BestMinimaxMove
// Determines the best move for the current player using the Minimax algorithm.
// Parameters:
// - state: The current game state
// - MaxDepth: The maximum depth to search
// Returns: The best move for the current player according to the Minimax evaluation

function BestMinimaxMove(state, MaxDepth) {

    // Initialize the global move score to track the best score for the current move
    const moves = LegalMoves(state);

    // Check if there are no legal moves available for the current player
    if (moves.length === 0) {
        return null;
    }

    // Initialize the best move to the first legal move
    let bestMove = moves[0];

    // Initialize the best score based on the current player
    let bestScore = state.player === 'B' ? -Infinity : Infinity;

    for (const move of moves) {
        const newState = ApplyMove(state, move);
        const score = Minimax(newState, 1, MaxDepth, newState.player === 'B');
        
        // Update the best move and best score based on the evaluation of the current move
        if (state.player === 'B') {
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
            // Continue evaluating the remaining moves for the maximizing player
        } else {
            if (score < bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
    }
    moveScore = bestScore; // Update the global move score with the best score found for the current move

    return bestMove; // Return the best move determined by the Minimax evaluation

}

// Function: AlphaBeta
// Implements the Alpha-Beta pruning algorithm to determine the optimal move for the current player.
// Parameters:
// - state: The current game state
// - depth: The current depth in the search tree
// - MaxDepth: The maximum depth to search
// - alpha: The current alpha value for pruning
// - beta: The current beta value for pruning
// - maximizingPlayer: True if the current player is the maximizing player (black), false otherwise
// Returns: The evaluated score of the best move for the current player

function AlphaBeta(state, depth, MaxDepth, alpha, beta, maximizingPlayer) {

    // Update the maximum depth reached so far
    maxDepthReached = Math.max(maxDepthReached, depth);

    // Check if the maximum search depth has been reached
    if (depth >= MaxDepth) {
        return Evaluate(state);
    }

    // Check if the current game state is a terminal state (win for either player)
    if (CheckWins(state.blackPieces) || CheckWins(state.redPieces)) {
        return Evaluate(state);
    }

    const moves = LegalMoves(state);
    
    // Check if there are no legal moves available for the current player
    if (moves.length === 0) {
        return Evaluate(state);
    }

    // Evaluate the best move for the current player using the Alpha-Beta pruning algorithm
    if (maximizingPlayer) {
        
        let bestScore = -Infinity;
        
        for (const move of moves) {
            const newState = ApplyMove(state, move);
            const score = AlphaBeta(newState, depth + 1, MaxDepth, alpha, beta, false);
            bestScore = Math.max(bestScore, score);
            alpha = Math.max(alpha, bestScore);
            if (beta <= alpha) {
                break;
            }
        }
        return bestScore; // Return the best score for the maximizing player
    
    } else {
        let bestScore = Infinity;
        for (const move of moves) {
            const newState = ApplyMove(state, move);
            const score = AlphaBeta(newState, depth + 1, MaxDepth, alpha, beta, true);
            bestScore = Math.min(bestScore, score);
            beta = Math.min(beta, bestScore);
            if (beta <= alpha) {
                break;
            }
        }
        return bestScore; // Return the best score for the minimizing player
    }


}

// Function: BestAlphaBetaMove
// Determines the best move for the current player using the Alpha-Beta pruning algorithm.
// Parameters:
// - state: The current game state
// - MaxDepth: The maximum depth to search
// Returns: The best move for the current player according to the Alpha-Beta evaluation

function BestAlphaBetaMove(state, MaxDepth) {
    const moves = LegalMoves(state);

    // Check if there are no legal moves available for the current player
    if (moves.length === 0) {
        return null;
    }

    // Initialize the best move and best score for the current player
    let bestMove = moves[0];
    let bestScore = state.player === 'B' ? -Infinity : Infinity;

    let alpha = -Infinity;
    let beta = Infinity;

    // Iterate through all legal moves to determine the best move
    for (const move of moves) {
        // Apply the move to generate a new game state
        
        const newState = ApplyMove(state, move);
        const score = AlphaBeta(newState, 1, MaxDepth, alpha, beta, newState.player === 'B');
       
        // Evaluate the score of the new game state using the Alpha-Beta pruning algorithm
        if (state.player === 'B') {
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            } // Update the best move and best score for the maximizing player
       alpha = Math.max(alpha, bestScore);
        
    } else {
            if (score < bestScore) {
                bestScore = score;
                bestMove = move;
            } // Update the best move and best score for the minimizing player
            
            beta = Math.min(beta, bestScore);
        }
    }
    moveScore = bestScore; // Update the global move score with the best score found for the current player
    
    return bestMove; // Return the best move determined by the Alpha-Beta evaluation
}

// function main
// Entry point of the program. Handles command-line arguments, reads input, and determines the best move using the specified algorithm.

function main() {


    // Parse command-line arguments for the algorithm and search depth
    const algorithm = process.argv[2];
    const depth = Number(process.argv[3]);

    // Validate the command-line arguments
    if (

        (algorithm !== 'minimax' && algorithm !== 'alphabeta') || !Number.isInteger(depth) || depth < 1
    ) {
        console.error("Usage: node search.js <minimax|alphabeta> <depth>");
        process.exit(1);
    }

    // Create a readline interface for reading input from the command line
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.on("line", function(input) {
        // Handle each line of input from the command line

        if (input.trim() === "") {
            return;
        }
        // Parse the input line to create the initial game state
        const state = parseState(input);

        ResetSearchMetrics(); // Reset the search metrics before evaluating the next move
        
        let bestMove; // Initialize the variable to store the best move determined by the search algorithm
        
        // Determine the best move using the specified search algorithm
        if (algorithm === 'minimax') {
            bestMove = BestMinimaxMove(state, depth);
            // Evaluate the best move using the Minimax algorithm
        } else if (algorithm === 'alphabeta') {
            bestMove = BestAlphaBetaMove(state, depth);
        }
        
        // Output the best move if one was found
        if (bestMove !== null) {
            process.stdout.write(`${bestMove[0]} ${bestMove[1]}\n`);
        }
        
        // Output the search metrics to the standard error stream
        process.stderr.write(`${algorithm},${nodesEvaluated},${maxDepthReached},${moveScore}\n`);
    });

}
main();

module.exports = {
    parseState,
    LegalMoves,
    ApplyMove,
    CheckWins,
    StateKey
};
