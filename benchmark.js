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
*/

"use strict";

const { spawnSync } = require("child_process");
const fs = require("fs");

const algorithms = ["minimax", "alphabeta"];

const depths = [1, 2, 3];

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

function RunBenchmarks() {

    const results = [];

    results.push(

        "algorithm,nodes_evaluated,max_depth,chosen_move_score,execution_time_ms"
    );

    for (const game of gameState) {

        for (const algorithm of algorithms) {

            for (const depth of depths) {

                const startTime = process.hrtime.bigint();
                console.log(`Running ${algorithm} with depth ${depth} on game ${game.name}`);
                
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

                const metrics = result.stderr.toString().trim();

                if (metrics) {
                    results.push(`${metrics},${executionTime.toFixed(4)}`);
                }


            }
        }
    }

    fs.writeFileSync("benchmark_results.csv", results.join("\n"), "utf-8");

}

RunBenchmarks();
