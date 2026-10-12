/*
Author: Maar Drew-Joseph
Major: Information Technology
Creation Date: 10/10/2026
Due Date: 10/12/2026
Course: CPSC 447
Professor: Dr. Schwesinger
Assignment: Project 3 - Adversarial Search
File: benchmark.js
Purpose: benchmarks the performance of the adversarial search algorithms (minimax and alpha-beta pruning) for the game.

Citations:

Author: OpenAI
Title: ChatGPT
Retrieved October 10, 2026 from https://chatgpt.com/
Note: Used for assistance with debugging, and selected portions of certain code implementations.

Author: Node.js Documentation
Title: "child_process - Node.js."
Retrieved October 10, 2026 from https://nodejs.org/api/child_process.html
Note: Used for reference on spawning child processes in Node.js.

Author: Node.js Documentation
Title: "Process - Node.js."
Retrieved October 10, 2026 from https://nodejs.org/api/process.html
Note: Used for reference on the Node.js process to measure the execution time of the child processes.
*/

"use strict";

// Import necessary modules for spawning child processes and file system operations
const { spawnSync } = require("child_process");
const fs = require("fs");

// Define the algorithms and depths to benchmark
const algorithms = ["minimax", "alphabeta"];

// Define the game states to benchmark
const depths = [1, 2, 3];

// Define the game states to benchmark
const gameState = [

    {

        name: "first_drop",
        state: "B 0 0 0 0 0 0 0 0 0 0"
    },
    
    {
        name: "second_drop",
        state: "B 0 0 0 3 15 0 0 0 8 22"
    },

    {
        name: "slide",
        state: "B 1 3 12 20 35 5 8 17 29 34"
    }
];

//Function: runBenchmark
//Runs the benchmark for a given algorithm on a specific input file and records the results
// Parameters: None
// Returns: None (results are recorded in the global results array)
function RunBenchmarks() {

    // Initialize the results array to store benchmark results
    const results = [];

    // Add the CSV header to the results array
    results.push(

        "algorithm,nodes_evaluated,max_depth,chosen_move_score,execution_time_ms"
    );

    // Iterate over each game state, algorithm, and depth to run the benchmarks
    for (const game of gameState) {

        for (const algorithm of algorithms) {

            for (const depth of depths) {

                const startTime = process.hrtime.bigint();
                console.log(`Running ${algorithm} with depth ${depth} on game ${game.name}`);
                
                // Spawn a child process to run the search algorithm with the specified depth and input game state
                const result = spawnSync(process.execPath, ["search.js", algorithm, String(depth)],
                {
                    input: game.state + "\n",
                    encoding: "utf-8",
                    cwd: process.cwd(),
                    timeout: 60000 // 60 seconds timeout for the child process
                });

                const endTime = process.hrtime.bigint();
                const executionTime = Number(endTime - startTime) / 1_000_000; // Convert nanoseconds to milliseconds

                if (result.error || result.status !== 0) {
                    console.error(`Error: ${result.error || 'Process exited with status ' + result.status}`);
                    continue; // Skip to the next iteration if there is an error
                }

                // Extract the metrics from the child process's standard error output
                const metrics = result.stderr.toString().trim();

                // If metrics are available, append them along with the execution time to the results array
                if (metrics) {
                    results.push(`${metrics},${executionTime.toFixed(4)}`);
                }


            }
        }
    }
    // Write the benchmark results to a CSV file
    fs.writeFileSync("benchmark_results.csv", results.join("\n"), "utf-8");

}

RunBenchmarks();
