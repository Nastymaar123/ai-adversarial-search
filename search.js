
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
*/

"use strict";


const { parseState, LegalMoves, ApplyMove, CheckWins, StateKey } = require("./game");

function ShapePotential(pieces) {

    const placePieces = pieces.filter(pos => pos !== 0);

    let score = 0;

    for (let i = 0; i < placePieces.length; i++) {

        const first = placePieces[i];
        const firstRow = Math.floor((first - 1) / 6);
        const firstCol = (first - 1) % 6;

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

            
        }
    }

    return score;
}

function ForkPotential(pieces) {

    const placePieces = pieces.filter(pos => pos !== 0);

    let horizontalForks = 0;
    let verticalForks = 0;
    let diagonalForks = 0;

    for (let i = 0; i < placePieces.length; i++) {
        
        const first = placePieces[i];
        const firstRow = Math.floor((first - 1) / 6);
        const firstCol = (first - 1) % 6;

        for (let j = i + 1; j < placePieces.length; j++) {
            const second = placePieces[j];
            const secondRow = Math.floor((second - 1) / 6);
            const secondCol = (second - 1) % 6;

            if (firstRow === secondRow) {
                horizontalForks += 1;
            }
            if (firstCol === secondCol) {
                verticalForks += 1;
            }
            if (Math.abs(firstRow - secondRow) === 1 && Math.abs(firstCol - secondCol) === 1) {
                diagonalForks += 1;
            }
        }
    }

    let threats = 0;

    if(horizontalForks > 0) {
        threats += horizontalForks;
    }
    
    if(verticalForks > 0) {
        threats += verticalForks;
    }
    
    if(diagonalForks > 0) {
        threats += diagonalForks;
    }

    if (threats > 2) {
        return 15;
    }
    
    return 0;
}
        




function Evaluate(state) {

    if (CheckWins(state.blackPieces)) {
        return 10000; // Black wins
    }
    if (CheckWins(state.redPieces)) {
        return -10000; // Red wins
    }

    let score = 0;

    const centerPositions = [15, 16, 17, 18, 19];
    
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
 
    score += ShapePotential(state.blackPieces);
    score -= ShapePotential(state.redPieces);
    
    score += ForkPotential(state.blackPieces);
    score -= ForkPotential(state.redPieces);

    return score;

}


function Minimax(state, depth, MaxDepth, maximizingPlayer) {

    if (depth >= MaxDepth) {
        return Evaluate(state);
    }

    if (CheckWins(state.blackPieces) || CheckWins(state.redPieces)) {
        return Evaluate(state);
    }

    const moves = LegalMoves(state);
    if (moves.length === 0) {
        return Evaluate(state);
    }

    if (maximizingPlayer) {
        let bestScore = -Infinity;
        for (const move of moves) {
            const newState = ApplyMove(state, move);

            const score = Minimax(newState, depth + 1, MaxDepth, false);
            bestScore = Math.max(bestScore, score);
        }
        return bestScore;
    
    } else {
        let bestScore = Infinity;
        for (const move of moves) {
            const newState = ApplyMove(state, move);
            const score = Minimax(newState, depth + 1, MaxDepth, true);
            bestScore = Math.min(bestScore, score);
        }
        return bestScore;
    }

}

function BestMinimaxMove(state, MaxDepth) {

    const moves = LegalMoves(state);

    if (moves.length === 0) {
        return null;
    }

    let bestMove = moves[0];

    let bestScore = state.player === 'B' ? -Infinity : Infinity;

    for (const move of moves) {
        const newState = ApplyMove(state, move);
        const score = Minimax(newState, 1, MaxDepth, state.player === 'B');
        
        if (state.player === 'B') {
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        } else {
            if (score < bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
    }
    
    return bestMove;

}

function AlphaBeta(state, depth, MaxDepth, alpha, beta, maximizingPlayer) {

    if (depth >= MaxDepth) {
        return Evaluate(state);
    }

    if (CheckWins(state.blackPieces) || CheckWins(state.redPieces)) {
        return Evaluate(state);
    }

    const moves = LegalMoves(state);
    
    if (moves.length === 0) {
        return Evaluate(state);
    }

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
        return bestScore;
    
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
        return bestScore;
    }


}

function BestAlphaBetaMove(state, MaxDepth) {
    const moves = LegalMoves(state);

    if (moves.length === 0) {
        return null;
    }

    let bestMove = moves[0];
    let bestScore = state.player === 'B' ? -Infinity : Infinity;

    let alpha = -Infinity;
    let beta = Infinity;

    for (const move of moves) {
        
        const newState = ApplyMove(state, move);
        const score = AlphaBeta(newState, 1, MaxDepth, alpha, beta, state.player === 'B');
        
        if (state.player === 'B') {
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
       alpha = Math.max(alpha, bestScore);
        
    } else {
            if (score < bestScore) {
                bestScore = score;
                bestMove = move;
            }
            
            beta = Math.min(beta, bestScore);
        }
    }
    
    return bestMove;
}

const testState = parseState("B 1 3 12 20 35 5 8 17 29 34");
console.log("Best AlphaBeta Move:", BestAlphaBetaMove(testState, 2));

console.log("Minimax Best Move:", BestMinimaxMove(testState, 2));




module.exports = {
    parseState,
    LegalMoves,
    ApplyMove,
    CheckWins,
    StateKey
};
