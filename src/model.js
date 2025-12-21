import PriorityQueue from "js-priority-queue";

let Vwalls = null, 
    Hwalls = null,
    currentPlayer = null,
    pos = null,
    wall_cnt = [];
    //gameHistory = [];



export function initialize() {
    Vwalls = Array(9).fill().map(() => Array(8).fill(false));
    Hwalls = Array(8).fill().map(() => Array(9).fill(false));
    currentPlayer = 0;
    pos = [[8, 4], [0, 4]];

    wall_cnt = [10, 10];
    
}

export function getCurrentPlayer() {
    return currentPlayer+1;
}

export function makeMove(r, c) {
    pos[currentPlayer] = [parseInt(r), parseInt(c)];
    currentPlayer = 1 - currentPlayer;
    console.log(pos);
}

export function makeWall(r, c, type) {
    r = parseInt(r); c = parseInt(c);
    if(type === 'wall-h') Hwalls[r][c] = Hwalls[r][c+1] = true;
    else Vwalls[r][c] = Vwalls[r+1][c] = true;
    wall_cnt[currentPlayer]--;
    currentPlayer = 1 - currentPlayer;
}

export function getLegibleMoves(ignore_op=false) {
    const moves = [];
    const [r, c] = pos[currentPlayer];
    const [op_r, op_c] = pos[1 - currentPlayer];

    const dr = [-1, 0, 1, 0];
    const dc = [0, 1, 0, -1];

    for (let i = 0; i < 4; i++) {
        if (isBlocked(r, c, i)) continue;

        const next_r = r + dr[i];
        const next_c = c + dc[i];

        if (!ignore_op && next_r === op_r && next_c === op_c) {
            if (!isBlocked(next_r, next_c, i)) {
                moves.push([next_r + dr[i], next_c + dc[i]]);
            } else {
                const diags = [(i + 3) % 4, (i + 1) % 4];
                
                for (let d of diags) {
                    if (!isBlocked(next_r, next_c, d)) {
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


export function isLegalWallPlacement(r,c, type) {

    r = parseInt(r); c = parseInt(c);
    let walls = {h: Hwalls.map(t => t.slice()), v: Vwalls.map(t => t.slice())};

    if(type === 'wall-h') walls.h[r][c] = walls.h[r][c+1] = true;
    else walls.v[r][c] = walls.v[r+1][c] = true;
    let p1 = getShortestPath(0, walls), p2 = getShortestPath(1, walls);
    return p1 && p2;
}


export function makeAiMove() {
    let legibleMoves = getLegibleMoves(), turn = currentPlayer === 0 ? 1 : -1;
    let walls = {h: Hwalls.map(t => t.slice()), v: Vwalls.map(t => t.slice())};
    

}

function gameEval(pos, walls, turn) {
    paths = [getShortestPath(0, walls, pos[0]), getShortestPath(1, walls, pos[1])];

    return  paths[1].cost - paths[0].cost + turn;
}

function getShortestPath(p, walls, coords) {
    let target = p ? 8 : 0;
    if(!coords) coords = [...pos[p]];
    if(!walls) walls = {h: Hwalls.map(r => r.slice()), v: Vwalls.map(r => r.slice())};
    
    let queue = new PriorityQueue({comparator: (a, b) => a.f - b.f});
    queue.queue({cost: 0, pos: coords, f: Math.abs(coords[0]-target)});
    let visited = new Set();

    while(queue.length) {
        let state = queue.dequeue();
        let pos = state.pos, cost = state.cost;
        
        if(visited.has(pos.join())) continue;

        if(pos[0] === target) {
            console.log("achieved: ", pos, 'target: ', target, 'root: ', state.rootMove);
            return {shortestDist: cost, bestMove: state.rootMove};
        }

        

        visited.add(pos.join());
        for(let i=0;i < 4;i++) {
            let new_pos;
            if(i == 0) {
                new_pos = [pos[0]-1, pos[1]];
            } else if(i == 1) {
                new_pos = [pos[0], pos[1]+1];
            }
            else if(i == 2) {
                new_pos = [pos[0]+1, pos[1]];
            }
            else if(i == 3) {
                new_pos = [pos[0], pos[1]-1];
            }

            if(!isBlocked(pos[0], pos[1], i, walls)) {
                if(state.rootMove) {
                    queue.queue({
                        cost:cost+1,
                        pos: new_pos,
                        f:cost+1 + Math.abs(new_pos[0]-target),
                        rootMove: state.rootMove
                    });
                }else {
                    queue.queue({
                        cost:cost+1,
                        pos: new_pos,
                        f:cost+1 + Math.abs(new_pos[0]-target),
                        rootMove: i
                    });
                }
            }
        }
        
    }

}

const isBlocked = (cr, cc, dir, walls) => {

    if(!walls) walls = {h: Hwalls, v: Vwalls};

    if (dir === 0) return cr === 0 || (walls.h[cr - 1] && walls.h[cr - 1][cc]); 
    if (dir === 1) return cc === 8 || (walls.v[cr] && walls.v[cr][cc]);         
    if (dir === 2) return cr === 8 || (walls.h[cr] && walls.h[cr][cc]);         
    if (dir === 3) return cc === 0 || (walls.v[cr] && walls.v[cr][cc - 1]);     
    return false;
}

