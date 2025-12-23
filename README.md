# Quoridor - AI Strategy Board Game

A complete desktop implementation of the abstract strategy board game **Quoridor**, developed for the CSE472s Artificial Intelligence course. This project features a professional GUI, a robust game logic engine, and an AI opponent powered by powerful search algorithms **that can reach a depth of up to 8-9 moves in just a few seconds**.

##  Game Overview
Quoridor is a $9 \times 9$ strategy game where the objective is to be the first to move your pawn to any square on the opposite side.
- **Movement:** Move one square orthogonally or jump over an adjacent opponent, or jump diagonally on your opponent side if there is a wall behind him.
- **Obstacles:** Place walls (2 squares long) to impede your opponent.
- **Golden Rule:** You can never completely block a player's path to their goal; a valid path must always exist.

##  Software Technologies
The application is built using a modern **JavaScript** stack packaged for the desktop:
- **Framework:** [Electron.js](https://www.electronjs.org/) (for cross-platform desktop integration).
- **Logic Engine:** Vanilla JavaScript (ES6+ Modules) implementing a custom **Model-View-Controller (MVC)**-inspired architecture.
- **Data Structures:** Utilizes `js-priority-queue` for efficient pathfinding and state evaluation.

##  AI & Algorithms
The project implements AI capable of strategic decision-making:

### 1. Minimax with Alpha-Beta Pruning
The core AI uses a **Minimax** tree search to evaluate potential future game states.
- **Alpha-Beta Pruning:** Optimizes the search by eliminating branches that cannot influence the final decision, significantly increasing search depth. priority queue is used to inspect highest return nodes first based on Heuristic Evaluation, and thus maximizing pruning efficiency.
- **Heuristic Evaluation:** Board states are scored based on relative wall counts, player turn advantage, and the difference in shortest-path distances to the goals for both players.

### 2. Pathfinding (A*)
To satisfy the "path-existence" requirement and provide the AI with distance metrics, the engine uses a priority-based search.
- **Shortest Path Calculation:** The AI calculates the exact number of moves needed to win, allowing it to "sense" when it is winning or losing.
- **Illegal Move Prevention:** Every potential wall placement is validated against the pathfinding algorithm to ensure it doesn't create a "dead end" for any player.

### 3. Dynamic Candidate Move Selection
Rather than checking all possible wall placements—which would be computationally expensive—the AI identifies "Candidate Moves" based on proximity to pawns and existing walls to maintain high performance.

## Key Features
- **Human vs. Human:** Local multiplayer on the same machine.
- **Human vs. AI:** Challenge the Minimax-based computer opponent.
- **AI difficulty control:** adjusting AI analysis depth (by default depth=6).


## Screenshots

> *gameplay examples*

<img width="1028" height="729" alt="Screenshot 2025-12-22 at 3 27 00 PM" src="https://github.com/user-attachments/assets/041128fa-8a38-492b-9dd9-1b0cee6c135f" />

<img width="1018" height="742" alt="Screenshot 2025-12-22 at 3 26 03 PM" src="https://github.com/user-attachments/assets/0f06ccef-8e0d-42a0-a57f-ddf1a611bdef" />


## Installation & Running
you can easily access the web version here: https://quoridor-project.netlify.app/

for the desktop App, make sure you have [npm installed](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm), then do the following steps:
1. **Clone the repository:**
   ```bash
   git clone https://github.com/amr-elmowaled/quoridor
   ```
2. **Install dependencies:**
```bash
   npm install
   ```
3. **Start the application:**
   ```bash
   npm start
   ```
## Demo video
video can be accessed through this link on google drive: 
https://drive.google.com/file/d/1IHPFy9I5x_8GTmrPE1Js6gCVznzSfSbt/view?usp=sharing
