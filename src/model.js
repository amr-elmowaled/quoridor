import PriorityQueue from "js-priority-queue";

export class Game {

    constructor(args={}) {

        this.Vwalls = args.Vwalls || Array(9).fill().map(() => Array(8).fill(false));
        this.Hwalls = args.Hwalls || Array(8).fill().map(() => Array(9).fill(false));
        this.currentPlayer = args.currentPlayer || 0;
        this.pos = args.pos || [[8, 4], [0, 4]];
        this.wall_cnt = args.wall_cnt || [10, 10];
    }

    getCurrentPlayer() {
        return this.currentPlayer + 1;
    }

    makeMove(r, c) {
        this.pos[this.currentPlayer] = [parseInt(r), parseInt(c)];
        this.currentPlayer = 1 - this.currentPlayer;
        console.log(this.pos);
    }

    makeWall(r, c, type) {
        r = parseInt(r);
        c = parseInt(c);
        if (type === 'wall-h') {
            this.Hwalls[r][c] = this.Hwalls[r][c + 1] = true;
        } else {
            this.Vwalls[r][c] = this.Vwalls[r + 1][c] = true;
        }
        this.wall_cnt[this.currentPlayer]--;
        this.currentPlayer = 1 - this.currentPlayer;
    }

    getLegibleMoves(ignore_op = false) {
        const moves = [];
        const [r, c] = this.pos[this.currentPlayer];
        const [op_r, op_c] = this.pos[1 - this.currentPlayer];

        const dr = [-1, 0, 1, 0];
        const dc = [0, 1, 0, -1];

        for (let i = 0; i < 4; i++) {
            if (this.isBlocked(r, c, i)) continue;

            const next_r = r + dr[i];
            const next_c = c + dc[i];

            if (!ignore_op && next_r === op_r && next_c === op_c) {
                if (!this.isBlocked(next_r, next_c, i)) {
                    moves.push([next_r + dr[i], next_c + dc[i]]);
                } else {
                    const diags = [(i + 3) % 4, (i + 1) % 4];
                    
                    for (let d of diags) {
                        if (!this.isBlocked(next_r, next_c, d)) {
                            moves.push([next_r + dr[d], next_c + dc[d]]);
                        }
                    }
                }
            } else {
                moves.push([next_r, next_c]);
            }
        }

        return moves;
    }

    isLegalWallPlacement(r, c, type) {
        r = parseInt(r);
        c = parseInt(c);
        let walls = this.getWalls();

        if (type === 'wall-h') {
            walls.h[r][c] = walls.h[r][c + 1] = true;
        } else {
            walls.v[r][c] = walls.v[r + 1][c] = true;
        }
        
        let p1 = this.getShortestPath(0, walls);
        let p2 = this.getShortestPath(1, walls);
        return p1 && p2;
    }

    getShortestPath(p, walls) {
        let target = p ? 8 : 0;
        let coords = [...this.pos[p]];
        if (!walls) walls = this.getWalls();
        
        let queue = new PriorityQueue({comparator: (a, b) => a.f - b.f});
        queue.queue({cost: 0, pos: coords, f: Math.abs(coords[0] - target)});
        let visited = new Set();

        while (queue.length) {
            let state = queue.dequeue();
            let pos = state.pos, cost = state.cost;
            
            if (visited.has(pos.join())) continue;

            if (pos[0] === target) {
                return {shortestDist: cost, bestMove: state.rootMove};
            }

            visited.add(pos.join());
            for (let i = 0; i < 4; i++) {
                let new_pos;
                if (i == 0) {
                    new_pos = [pos[0] - 1, pos[1]];
                } else if (i == 1) {
                    new_pos = [pos[0], pos[1] + 1];
                } else if (i == 2) {
                    new_pos = [pos[0] + 1, pos[1]];
                } else if (i == 3) {
                    new_pos = [pos[0], pos[1] - 1];
                }

                if (!this.isBlocked(pos[0], pos[1], i, walls)) {
                    if (state.rootMove) {
                        queue.queue({
                            cost: cost + 1,
                            pos: new_pos,
                            f: cost + 1 + Math.abs(new_pos[0] - target),
                            rootMove: state.rootMove
                        });
                    } else {
                        queue.queue({
                            cost: cost + 1,
                            pos: new_pos,
                            f: cost + 1 + Math.abs(new_pos[0] - target),
                            rootMove: i
                        });
                    }
                }
            }
        }
    }

    isBlocked(cr, cc, dir, walls) {
        if (!walls) {
            walls = {h: this.Hwalls, v: this.Vwalls};
        }

        if (dir === 0) return cr === 0 || (walls.h[cr - 1] && walls.h[cr - 1][cc]); 
        if (dir === 1) return cc === 8 || (walls.v[cr] && walls.v[cr][cc]);         
        if (dir === 2) return cr === 8 || (walls.h[cr] && walls.h[cr][cc]);         
        if (dir === 3) return cc === 0 || (walls.v[cr] && walls.v[cr][cc - 1]);     
        return false;
    }

    // Utility methods for accessing game state
    getPlayerPosition(player) {
        return [...this.pos[player]];
    }

    getWallCount(player) {
        return this.wall_cnt[player];
    }

    getWalls() {
        return {
            h: this.Hwalls.map(r => r.slice()),
            v: this.Vwalls.map(r => r.slice())
        };
    }
}

// Example usage:
// const game = new Game();
// game.makeMove(7, 4);
// game.makeWall(3, 4, 'wall-h');
// const moves = game.getLegibleMoves();


/*
export function makeAiMove() {
    let legibleMoves = getLegibleMoves(), turn = currentPlayer === 0 ? 1 : -1;
    let walls = {h: Hwalls.map(t => t.slice()), v: Vwalls.map(t => t.slice())};
    

}

function getCandidateActions(pos, walls, tur) {
    let candidates = getLegibleMoves();
}

function gameEval(pos, walls, turn) {
    paths = [getShortestPath(0, walls, pos[0]), getShortestPath(1, walls, pos[1])];

    return  paths[1].cost - paths[0].cost + turn;
}

*/

