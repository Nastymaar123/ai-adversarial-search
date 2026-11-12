# Project 3 - Adversarial Search

## Author
Maar Drew-Joseph

## Course Information

- Course: CPSC 447
- Professor: Dr. Schwesinger
- Major: Information Technology
- Created: 10/03/2026
- Due Date: 10/12/2026

## Project Overview

This project implements adversarial search algorithms for a
two-player strategy game played on a 6×6 board.

The application uses JavaScript and Node.js to evaluate game
states and select optimal moves using two algorithms:

- Minimax
- Alpha-Beta Pruning

The game includes two phases: placing pieces on the board
and moving pieces between adjacent positions.

A heuristic evaluation function considers center control,
piece positioning, and potential winning formations.

The project also includes automated benchmarking to compare
both algorithms across different game states and search depths.

In the recorded depth-3 benchmarks, Alpha-Beta Pruning
reduced the number of evaluated nodes by approximately
78%–85% compared with standard Minimax.

## How to Run

this project uses JavaScript and Node.js for the implementation of the Minimax and Alpha-Beta Pruning for the borad game.

### Requirments 

- Node.js installed
- A terminal
- The project files:
    - game.js
    - search.js
    - benchmark.js

### Running the Search Algorithms

To run Minimax at depth 2:

```powershell
node search.js minimax 2
```

To run Alpha-Beta Pruning at depth 2:

```powershell
node search.js alphabeta 2
```

The program reads a game state from standard input (stdin).

Example input:

```text
B 1 3 12 20 35 5 8 17 29 34
```

the first value (B) is the current player
the first five values are the Black pieces.
the final five values are the Red piences.

the program then prints the selcted move to standard output (stdout) by using this format:

```text
FROM TO
```

A move that begins with 0 represnts placing a place during the Drop Phase.

The search metrics are written to standard error (stderr):

```text
algorithm,nodes_evaluated,max_depth,chosen_move_score,execution_time_ms
```

the program processes input lines unitl it reaches EOF

### Running the Benchmaerks

To get the benchmark results, run:

```powershell
node benchmark.js
```

the benchmark script executes both algorithms at depths 1, 2, and 3 by using three game states:

- First Drop
- Second Drop
- Slide

the results are then saved to benchmark_results.csv

the benchamrk records the algorithm, nodes evaulted, maximum srarch depth, chosen move socre, and total execution time in milliseconds


## State-Space & Evaluation Function Design

### Board Representation

The game is played on a 6x6 board containing 36 positions which are numbered from 1 to 36.

The positions are numbered from left to right starting at the top-left corner of the board.

```text
 1   2   3   4   5   6
 7   8   9  10  11  12
13  14  15  16  17  18
19  20  21  22  23  24
25  26  27  28  29  30
31  32  33  34  35  36
```

Each position can be converted into a row and column using the following formulas:

```text
row = Math.floor((position - 1) / 6)
col = (position - 1) % 6
```

A row and column can be converted back into a board position using:

```text
position = row * 6 + col + 1
```

### Game State Representation

A game state contains the current player and the positions
of both players' pieces.

The state is represented in JavaScript as an object:

```javascript
{
    player: "B",
    blackPieces: [1, 3, 12, 20, 35],
    redPieces: [5, 8, 17, 29, 34]
}
```

The player value indicates whose turn it is:

- B represents Black.
- R represents Red.

Each player has an array containing five positions.

During the Drop Phase, a value of 0 represents a piece
that has not yet been placed on the board.

During the Slide Phase, all five pieces have been placed,
and players move their pieces to adjacent empty positions.

### State Transitions

The LegalMoves() function generates the available moves for the current player.

During the Drop Phase, a move is represented as:

```text
0 TARGET
```

During the Slide Phase, a move is represented as:

```text
FROM TO
```

The ApplyMove() function creates the resulting state after a legal move is applied and switches the current player.

Piece positions are sorted to maintain a consistent state representation.


### Evaluation Function Design

The Evaluate() function estimates the strength of a game
state from Black's perspective.

Black is the maximizing player, while Red is the
minimizing player.

Positive scores favor Black, while negative scores
favor Red.

#### Terminal States

If Black has won, the evaluation function returns +10000.

If Red has won, the evaluation function returns -10000.

These terminal scores take priority over positional scoring.

#### Center Control

The current implementation assigns 10 points for each
Black piece occupying one of these positions:

15, 16, 21, 22

Each Red piece occupying one of these positions
subtracts 10 points.


#### Shape Potential

 ShapePotential() function evaluates the positioning of each player's pieces to identify arrangements that determines the future winning.

The function examines every pair of placed pieces
and assigns points based on their positions.

The scoring rules are:

- Same row: +1 point
- Same column: +1 point
- Diagonally adjacent pieces: +2 points
- Pieces separated vertically by two squares: +2 points
- Pieces separated horizontally by two squares: +2 points

The additional vertical and horizontal conditions reward piece arrangements that could contribute to a tilted-square (diamond) winning configuration.

These scores are heuristic estimates rather than complete checks for partially formed winning shapes.

Black's ShapePotential score is added to the evaluation, while Red's ShapePotential score is subtracted.

This encourages Minimax and Alpha-Beta Pruning to favor moves that improve a player's potential winning patterns.


#### Fork Potential

The ForkPotential() function counts pairs of pieces
that share a row, share a column, or are diagonally
adjacent.

If the combined count exceeds 2, the function
returns a bonus of 15 points.

Otherwise, it returns 0.

This is a heuristic approximation of attacking
potential rather than an explicit check for two
independent winning threats.

#### Evaluation Formula

For non-terminal states, the evaluation function is:

E(s) = 10(CB - CR) + (SB - SR) + (FB - FR)

Where:

- CB = Black pieces in the designated center positions
- CR = Red pieces in the designated center positions
- SB = Black's ShapePotential score
- SR = Red's ShapePotential score
- FB = Black's ForkPotential score
- FR = Red's ForkPotential score

Terminal states override this formula:

- Black win: E(s) = +10000
- Red win: E(s) = -10000

The Minimax and Alpha-Beta algorithms use these scores
to evaluate game states at the search depth limit.


## Search Performance

The performance of Minimax and Alpha-Beta Pruning was
measured using three game states:

- First Drop
- Second Drop
- Slide

Each algorithm was tested at search depths 1, 2, and 3.

The benchmark recorded the number of evaluated nodes,
maximum search depth, chosen move score, and total
execution time.

### Nodes Evaluated

| Game State | Depth | Minimax | Alpha-Beta |
|---|---|---|---|
| First Drop | 1 | 36 | 36 |
| First Drop | 2 | 1260 | 315 |
| First Drop | 3 | 42840 | 8974 |
| Second Drop | 1 | 32 | 32 |
| Second Drop | 2 | 992 | 221 |
| Second Drop | 3 | 29760 | 4532 |
| Slide | 1 | 20 | 20 |
| Slide | 2 | 519 | 155 |
| Slide | 3 | 10568 | 2285 |

### Alpha-Beta Pruning Efficiency

At depth 1, both algorithms evaluated the same number
of nodes because there was no opportunity to prune
deeper branches.

At depth 3, Alpha-Beta Pruning reduced the number of
evaluated nodes by:

- First Drop: 79.0%
- Second Drop: 84.8%
- Slide: 78.4%

These results demonstrate that Alpha-Beta Pruning
can eliminate large portions of the search tree
without changing the final evaluation score.

### Execution Time

| Game State | Minimax (ms) | Alpha-Beta (ms) |
|---|---|---|
| First Drop | 190.1092 | 114.8007 |
| Second Drop | 297.3108 | 121.8745 |
| Slide | 143.7002 | 99.5202 |

The execution-time table shows the depth-3 results.

Alpha-Beta Pruning completed all three depth-3 tests
faster than Minimax.

Execution times include Node.js subprocess startup
overhead and may vary between benchmark runs.

### Performance Analysis

Minimax explores all legal moves until reaching the
specified depth or a terminal state.

Alpha-Beta Pruning uses alpha and beta bounds to
skip branches that cannot improve the final decision.

As search depth increases, the number of possible
game states grows rapidly.

The benchmark results demonstrate that Alpha-Beta
Pruning is more efficient than unpruned Minimax,
particularly at greater search depths.


## Theoretical vs. Empirical Complexity

### Minimax Time Complexity

Minimax searches the game tree by exploring possible
moves until reaching the maximum search depth or a
terminal state.

Its theoretical time complexity is:

O(b^m)

Where:

- b = average branching factor (legal moves per state)
- m = maximum search depth

As the search depth increases, the number of possible
game states grows exponentially.

For example, if the average branching factor is 20:

- Depth 1: 20 possible leaf nodes
- Depth 2: 400 possible leaf nodes
- Depth 3: 8,000 possible leaf nodes

These are illustrative estimates rather than exact
counts for this game's changing branching factor.

### Alpha-Beta Pruning Time Complexity

Alpha-Beta Pruning improves Minimax by eliminating
branches that cannot influence the final decision.

With ideal move ordering, its theoretical time
complexity can approach:

O(b^(m/2))

However, its worst-case time complexity remains:

O(b^m)

The effectiveness of Alpha-Beta Pruning depends
heavily on the order in which moves are evaluated.

### Theoretical vs. Empirical Results

The benchmark results demonstrate the exponential
growth of Minimax as search depth increases.

For the First Drop state:

| Depth | Minimax Nodes | Alpha-Beta Nodes |
|---|---|---|
| 1 | 36 | 36 |
| 2 | 1260 | 315 |
| 3 | 42840 | 8974 |

At depth 3, Alpha-Beta Pruning evaluated approximately
79.0% fewer nodes than Minimax.

Similar improvements were observed in the Second Drop
and Slide states.

These results support the theoretical expectation
that Alpha-Beta Pruning can substantially reduce
the amount of search required.

However, the measured results do not directly prove
the ideal O(b^(m/2)) bound because move ordering,
board configurations, and branching factors affect
the amount of pruning achieved.

### Cyclic Slide Paths and Infinite-Turn Loops

During the Slide Phase, players can move pieces
between adjacent positions.

A sequence of moves may eventually return the
board to a previously encountered state.

This creates cycles in the game state graph.

Without safeguards, repeatedly exploring these
states can cause unnecessary computation.

If a search is allowed to continue without a depth
limit or cycle detection, repeated states can
contribute to infinite-turn loops.

The current implementation prevents unbounded
recursive search by enforcing a maximum search depth.

However, it does not currently use a visited-state
table or transposition table to eliminate repeated
states.

As a result, the same board configuration may be
evaluated multiple times through different move
sequences.

Possible future improvements include:

- Transposition tables to cache evaluated states
- Cycle detection using previously visited states
- Improved move ordering for Alpha-Beta Pruning
- Iterative deepening to manage search depth

These improvements could reduce repeated work
and make deeper searches more practical.

### Conclusion

The project demonstrates how Minimax and Alpha-Beta
Pruning can be used to select moves in a two-player
adversarial board game.

The benchmark results show that Alpha-Beta Pruning
evaluates significantly fewer nodes than Minimax,
especially at greater search depths.

Both algorithms produced identical evaluation scores
for matching game states and search depths.

Overall, Alpha-Beta Pruning provides a more efficient
approach to adversarial search while preserving the
decision quality of Minimax.
