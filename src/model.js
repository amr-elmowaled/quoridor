let Vwalls = null, 
    Hwalls = null,
    currentPlayer = null,
    pos = null,
    wall_cnt = [],
    gameHistory = [];



export function initialize() {
    Vwalls = Array(9).fill().map(() => Array(8).fill(false));
    Hwalls = Array(8).fill().map(() => Array(9).fill(false));
    currentPlayer = 0;
    wall_cnt = [10, 10];
    pos = [[8, 4], [0, 4]];
}

export function getCurrentPlayer() {
    return currentPlayer+1;
}

export function makeMove(r, c) {
    pos[currentPlayer] = [parseInt(r), parseInt(c)];
    currentPlayer = 1 - currentPlayer;
    console.log(pos);
}

export function makeHWall(r, c) {
    r = parseInt(r); c = parseInt(c);
    Hwalls[r][c] = Hwalls[r][c+1] = true;
    wall_cnt[currentPlayer]--;
    currentPlayer = 1 - currentPlayer;
}
export function makeVWall(r, c) {
    r = parseInt(r); c = parseInt(c);
    Vwalls[r][c] = Vwalls[r+1][c] = true;
    wall_cnt[currentPlayer]--;
    currentPlayer = 1 - currentPlayer;
}

export function getLegibleMoves(ignore_op=false) {
    const moves = [];
    const [r, c] = pos[currentPlayer];
    const [op_r, op_c] = pos[1 - currentPlayer];

    const dr = [-1, 0, 1, 0];
    const dc = [0, 1, 0, -1];

    const isBlocked = (cr, cc, dir) => {
        if (dir === 0) return cr === 0 || (Hwalls[cr - 1] && Hwalls[cr - 1][cc]); 
        if (dir === 1) return cc === 8 || (Vwalls[cr] && Vwalls[cr][cc]);         
        if (dir === 2) return cr === 8 || (Hwalls[cr] && Hwalls[cr][cc]);         
        if (dir === 3) return cc === 0 || (Vwalls[cr] && Vwalls[cr][cc - 1]);     
        return false;
    };

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

