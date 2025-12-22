import PriorityQueue from "js-priority-queue";


export class Game {

    constructor(args={}) {

        this.Vwalls = args.Vwalls || Array(9).fill().map(() => Array(8).fill(false));
        this.Hwalls = args.Hwalls || Array(8).fill().map(() => Array(9).fill(false));
        this.currentPlayer = args.currentPlayer || 0;
        this.pos = args.pos || [[8, 4], [0, 4]];
        this.wall_cnt = args.wall_cnt || [10, 10];
        this.wall_addresses = {v:[], h:[]};
    }

    getCurrentPlayer() {
        return this.currentPlayer + 1;
    }

    makeMove(r, c) {
        this.pos[this.currentPlayer] = [parseInt(r), parseInt(c)];
        this.currentPlayer = 1 - this.currentPlayer;
    }

    makeWall(r, c, type) {
        r = parseInt(r);
        c = parseInt(c);
        if (type === 'wall-h' || type === 'h') {
            this.Hwalls[r][c] = this.Hwalls[r][c + 1] = true;
            this.wall_addresses.h.push([r, c]);
        } else {
            this.Vwalls[r][c] = this.Vwalls[r + 1][c] = true;
            this.wall_addresses.v.push([r, c]);
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

    getShortestPath(p, walls, coords) {
    const target = p ? 8 : 0;
    const start = coords || [...this.pos[p]];
    
    if (!walls) {
        walls = this.getWalls();
    }
    
    if (start[0] === target) {
        return { shortestDist: 0, rootMove: null };
    }
    
    const queue = new PriorityQueue({ 
        comparator: (a, b) => a.f - b.f 
    });
    
    const visited = new Set();
    const encodePos = (r, c) => r * 9 + c;
    
    const directions = [
        [-1, 0],  
        [0, 1],   
        [1, 0],   
        [0, -1]   
    ];
    
    queue.queue({
        cost: 0,
        r: start[0],
        c: start[1],
        f: Math.abs(start[0] - target),
        rootMove: null
    });
    
    while (queue.length > 0) {
        const state = queue.dequeue();
        const { r, c, cost, rootMove } = state;
        
        const key = encodePos(r, c);
        if (visited.has(key)) continue;
        
        if (r === target) {
            return { shortestDist: cost, rootMove };
        }
        
        visited.add(key);
        
        for (let dir = 0; dir < 4; dir++) {
            if (this.isBlocked(r, c, dir, walls)) continue;
            
            const newR = r + directions[dir][0];
            const newC = c + directions[dir][1];
            const newKey = encodePos(newR, newC);
            
            if (visited.has(newKey)) continue;
            
            const newCost = cost + 1;
            const heuristic = Math.abs(newR - target);
            
            queue.queue({
                cost: newCost,
                r: newR,
                c: newC,
                f: newCost + heuristic,
                rootMove: rootMove !== null ? rootMove : dir
            });
        }
    }
    
    return null;
}

    isBlocked(cr, cc, dir, walls) {
        if (!walls) {
            walls = {h: this.Hwalls, v: this.Vwalls};
        }

        if (dir === 0) return cr === 0 || !!(walls.h[cr - 1] && walls.h[cr - 1][cc]); 
        if (dir === 1) return cc === 8 || !!(walls.v[cr] && walls.v[cr][cc]);         
        if (dir === 2) return cr === 8 || !!(walls.h[cr] && walls.h[cr][cc]);         
        if (dir === 3) return cc === 0 || !!(walls.v[cr] && walls.v[cr][cc - 1]);     
        return false;
    }

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

    getCandidateMoves() {

        let candidates = {
            p: this.getLegibleMoves(),
            h: new Set(),
            v: new Set()
        };
        if(this.wall_cnt[this.currentPlayer] >= 1) {

            for(let [r,c] of this.wall_addresses.h) {
                if(this.freeWallArea(r, c-2, 'h')) {
                    candidates.h.add(JSON.stringify([r,c-2]));
                }
                if(this.freeWallArea(r, c+2, 'h')) {
                    candidates.h.add(JSON.stringify([r,c+2]));
                }

                if(this.freeWallArea(r-1, c-1, 'v')) {
                    candidates.v.add(JSON.stringify([r-1, c-1]));
                }
                if(this.freeWallArea(r+1, c-1, 'v')) {
                    candidates.v.add(JSON.stringify([r+1, c-1]));
                }
                
                if(this.freeWallArea(r-1, c+1, 'v')) {
                    candidates.v.add(JSON.stringify([r-1, c+1]));
                }
                if(this.freeWallArea(r+1, c+1, 'v')) {
                    candidates.v.add(JSON.stringify([r+1, c+1]));
                }
            }
            for(let [r,c] of this.wall_addresses.v) {
                if(this.freeWallArea(r-2, c, 'v')) {
                    candidates.v.add(JSON.stringify([r-2,c]));
                }
                if(this.freeWallArea(r+2, c, 'v')) {
                    candidates.v.add(JSON.stringify([r+2,c]));
                }

                if(this.freeWallArea(r-1, c-1, 'h')) {
                    candidates.h.add(JSON.stringify([r-1, c-1]));
                }
                if(this.freeWallArea(r+1, c-1, 'h')) {
                    candidates.h.add(JSON.stringify([r+1, c-1]));
                }
                
                if(this.freeWallArea(r-1, c+1, 'h')) {
                    candidates.h.add(JSON.stringify([r-1, c+1]));
                }
                if(this.freeWallArea(r+1, c+1, 'h')) {
                    candidates.h.add(JSON.stringify([r+1, c+1]));
                }
            }

            let [op_r, op_c] = this.pos[1 - this.currentPlayer];

            for(let dim of ['v', 'h']) {
                if(this.freeWallArea(op_r, op_c, dim)) candidates[dim].add(JSON.stringify([op_r, op_c]));
                if(this.freeWallArea(op_r-1, op_c, dim)) candidates[dim].add(JSON.stringify([op_r-1, op_c]));
                if(this.freeWallArea(op_r, op_c-1, dim)) candidates[dim].add(JSON.stringify([op_r, op_c-1]));
                if(this.freeWallArea(op_r-1, op_c-1, dim)) candidates[dim].add(JSON.stringify([op_r-1, op_c-1]));

            }
            /*
            if(this.freeWallArea(op_r, op_c, 'h')) candidates.h.add(JSON.stringify([op_r, op_c]));
            if(this.freeWallArea(op_r, op_c-1, 'h')) candidates.h.add(JSON.stringify([op_r, op_c-1]));
            if(this.freeWallArea(op_r-1, op_c, 'h')) candidates.h.add(JSON.stringify([op_r-1, op_c]));
            if(this.freeWallArea(op_r-1, op_c-1, 'h')) candidates.h.add(JSON.stringify([op_r-1, op_c-1]));
             */
        }

        candidates.h = [...candidates.h].map(JSON.parse);
        candidates.v = [...candidates.v].map(JSON.parse);
        return candidates;

    }

    freeWallArea(r, c, dim) {
        const freeSegment = (seg) => seg !== undefined && seg !== true;
        const walls = this.getWalls();

        if (dim === 'h') {
            if (!walls.h[r]) return false; 
            
            return freeSegment(walls.h[r][c]) && 
                freeSegment(walls.h[r][c + 1]) && 
                !this.wall_addresses.v.some(w => w[0] === r && w[1] === c);
        }

        if (dim === 'v') {
            if (!walls.v[r] || !walls.v[r + 1]) return false;

            return freeSegment(walls.v[r][c]) && 
                freeSegment(walls.v[r + 1][c]) && 
                !this.wall_addresses.h.some(w => w[0] === r && w[1] === c);
        }

        return false;
    }

    makeAiMove(depth=4, forceMiniMax=false) {

        
        let mostPromisingBoard;
        
        if(this.wall_cnt[this.currentPlayer] || forceMiniMax) {
            mostPromisingBoard = minimax(this, depth);

            console.log('game evaluation:', mostPromisingBoard.heuristic);
            console.log('pruning counter', pruning_cnt);
            pruning_cnt = {};
        }else {

            console.log('A* in control');
            mostPromisingBoard = this.getShortestPath(this.currentPlayer);
            let m = mostPromisingBoard.rootMove;
            let [op_r, op_c] = this.pos[1 - this.currentPlayer];
            let [r, c] = this.pos[this.currentPlayer];
            
            if(m === 0) r--;
            else if(m === 1) c++;
            else if(m === 2) r++;
            else c--;

            console.log('got: ',r, c)
            if(op_r === r && op_c === c) {
                m = this.getShortestPath(this.currentPlayer, this.getWalls(), [r, c]).rootMove;
                if(m === 0) r--;
                else if(m === 1) c++;
                else if(m === 2) r++;
                else c--;

                try {
                    mostPromisingBoard.rootMove = ['p',...this.getLegibleMoves().find(k => k[0] === r && k[1] === c)];
                }catch {
                    return this.makeAiMove(depth, true);
                }
                
            }else {
                mostPromisingBoard.rootMove = ['p', r, c];
            }
        }

        return mostPromisingBoard.rootMove;
    }

    gameEval() {
        let turn = this.currentPlayer === 0 ? 1 : -1;
        let paths = [this.getShortestPath(0), this.getShortestPath(1)];

        if(paths[0] && paths[1]) 
            return (0.4)*(this.wall_cnt[0] - this.wall_cnt[1]) + paths[1].shortestDist - paths[0].shortestDist + turn*0.01;
    }

    copy() {
        let walls = this.getWalls();
        return new Game({
            Vwalls: walls.v,
            Hwalls: walls.h,
            currentPlayer: this.getCurrentPlayer()-1,
            pos: [[...this.pos[0]], [...this.pos[1]]],
            wall_cnt: [...this.wall_cnt],
            wall_addresses: {
                v: this.wall_addresses.v.map(m => [...m]),
                h: this.wall_addresses.h.map(m => [...m])
            }
        });
    }
}

var pruning_cnt = {};

function minimax(game, h, alpha=-Infinity, beta=Infinity) {

    if(h <= 0) return game;
        
    let turn = game.currentPlayer === 0 ? 1 : -1;
    let q = new PriorityQueue({comparator: (a, b) => turn*(b.heuristic - a.heuristic)});
    let candidateMoves = game.getCandidateMoves();
    
    for(const type of Object.keys(candidateMoves)) {

        for(const move of candidateMoves[type]) {
            let temp_game = game.copy();

            if(type == 'p') temp_game.makeMove(...move);
            else temp_game.makeWall(...move, `wall-${type}`);

            if(temp_game.pos[0][0] === 0) {
                temp_game.heuristic = 1000;
            }else if(temp_game.pos[1][0] === 8) {
                temp_game.heuristic = -1000;
            }else {
                temp_game.heuristic = temp_game.gameEval();
            }
            temp_game.rootMove = game.rootMove ? game.rootMove : [type, ...move];
            temp_game.valueOf = () => temp_game.heuristic;

            if(temp_game.heuristic !== undefined) q.queue(temp_game);
        }
        
    }

    if(turn === 1) {
        let bestVal = -Infinity;
        while(q.length) {

            let temp_game = q.dequeue();
            if(temp_game.pos[0][0] === 0) {
                bestVal = temp_game;
                break;
            }
            let val = minimax(temp_game, h-1, alpha, beta);
            bestVal = val > bestVal ? val : bestVal;
            alpha = bestVal > alpha ? bestVal : alpha;

            if(beta <= alpha) {
                if(!pruning_cnt[h]) pruning_cnt[h] = [];
                pruning_cnt[h].push(temp_game.rootMove);
                break;
            }
        }

        return bestVal;

    }else {
        let bestVal = Infinity;
        while(q.length) {
            let temp_game = q.dequeue();

            if(temp_game.pos[1][0] === 8) {
                bestVal = temp_game;
                break;
            }

            let val = minimax(temp_game, h-1, alpha, beta);
            bestVal = val < bestVal ? val : bestVal;
            beta = bestVal < beta ? bestVal : beta;

            if(beta <= alpha) {
                if(!pruning_cnt[h]) pruning_cnt[h] = [];
                pruning_cnt[h].push(temp_game.rootMove);
                break;
            }
        }

        return bestVal;
    }
    
}