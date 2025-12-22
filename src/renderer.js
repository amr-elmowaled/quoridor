import { Game } from './model.js';

const boardElement = document.getElementById('game-board');
const aiToggle = document.getElementById('ai-toggle');


let isAiEnabled = false;
let gameFinished = false;
let hoveredWall = null;
let game = new Game();
let wall_cnt = [10, 10];
let legalMoves = [];


window.onload = () => {

    createBoard();
    placePawn(0, 4, 'p2'); 
    placePawn(8, 4, 'p1'); 

    legalMoves = game.getLegibleMoves();
    legalMoves.forEach((move) => {
      placePawn(...move, 'potential-move');
      getCell(...move).classList.add('clickable');
    });
};

function createBoard() {
    boardElement.innerHTML = '';
    
    for (let r = 0; r < 17; r++) {
        for (let c = 0; c < 17; c++) {
            const div = document.createElement('div');
            
            const isRowOdd = r % 2 !== 0;
            const isColOdd = c % 2 !== 0;

            if (!isRowOdd && !isColOdd) {
                div.className = 'cell';
                div.dataset.type = 'cell';
                div.dataset.r = Math.floor(r/2);
                div.dataset.c = Math.floor(c/2);
                
                div.onclick = () => handleCellClick(div);

            } else if (isRowOdd && !isColOdd) {
                const logicR = Math.floor(r/2);
                const logicC = Math.floor(c/2);
                
                div.className = 'wall-slot wall-h';
                div.dataset.type = 'wall-h';
                div.dataset.r = logicR; 
                div.dataset.c = logicC;
                
                if (logicC === 8) {
                    div.classList.add('disabled');
                } else {
                    div.onmouseenter = () => handleWallHover(div);
                    div.onmouseleave = () => clearWallHover();
                    div.onclick = () => handleWallClick(div);
                }

            } else if (!isRowOdd && isColOdd) {
                const logicR = Math.floor(r/2);
                const logicC = Math.floor(c/2);
                
                div.className = 'wall-slot wall-v';
                div.dataset.type = 'wall-v';
                div.dataset.r = logicR;
                div.dataset.c = logicC;
                
                if (logicR === 8) {
                    div.classList.add('disabled');
                } else {
                    div.onmouseenter = () => handleWallHover(div);
                    div.onmouseleave = () => clearWallHover();
                    div.onclick = () => handleWallClick(div);
                }

            } else {
                div.className = 'wall-center';
                div.dataset.type = 'wall-center';
                div.dataset.r = Math.floor(r/2);
                div.dataset.c = Math.floor(c/2);
            }

            boardElement.appendChild(div);
        }
    }
}

function getWallGroup(wallDiv) {
    const type = wallDiv.dataset.type;
    const r = parseInt(wallDiv.dataset.r);
    const c = parseInt(wallDiv.dataset.c);
    
    const walls = [];
    
    if (type === 'wall-h') {
        walls.push(wallDiv);
        
        if (c < 8) {
            const nextWall = document.querySelector(`.wall-h[data-r='${r}'][data-c='${c + 1}']`);
            if (nextWall) walls.push(nextWall);
            
            const centerWall = document.querySelector(`.wall-center[data-r='${r}'][data-c='${c}']`);
            if (centerWall) walls.push(centerWall);
        }
    } else if (type === 'wall-v') {
        walls.push(wallDiv);
        
        if (r < 8) {
            const nextWall = document.querySelector(`.wall-v[data-r='${r + 1}'][data-c='${c}']`);
            if (nextWall) walls.push(nextWall);
            
            const centerWall = document.querySelector(`.wall-center[data-r='${r}'][data-c='${c}']`);
            if (centerWall) walls.push(centerWall);
        }
    }
    
    return walls;
}

function handleWallHover(wallDiv) {
    if (wallDiv.classList.contains('placed') || wallDiv.classList.contains('disabled')) return;
    
    const walls = getWallGroup(wallDiv);
    
    const anyPlaced = walls.some(w => w.classList.contains('placed'));
    if (anyPlaced) return;
    
    hoveredWall = walls;
    
    walls.forEach(w => {
        if (!w.classList.contains('placed')) {
            w.style.backgroundColor = 'var(--accent-color)';
        }
    });
}

function clearWallHover() {
    if (hoveredWall) {
        hoveredWall.forEach(w => {
            if (!w.classList.contains('placed')) {
                w.style.backgroundColor = '';
            }
        });
        hoveredWall = null;
    }
}

function disableWall(wall) {
  if (wall && !wall.classList.contains('placed')) {
      wall.classList.add('disabled');
      wall.onmouseenter = null;
      wall.onmouseleave = null;
      wall.onclick = null;
  }
}

function getWall(r, c, t) {

    return document.querySelector(`.wall-${t}[data-r='${r}'][data-c='${c}']`);
}
function disableOverlappingWalls(wallDiv) {
    const type = wallDiv.dataset.type;
    const r = parseInt(wallDiv.dataset.r);
    const c = parseInt(wallDiv.dataset.c);
    
    if (type === 'wall-h') {
        if (c > 0) {
            //const prevWall = document.querySelector(`.wall-h[data-r='${r}'][data-c='${c - 1}']`);
            disableWall(getWall(r, c-1, 'h'));
        }
        
        if (c < 7) {
            //const nextWall = document.querySelector(`.wall-h[data-r='${r}'][data-c='${c + 1}']`);
            disableWall(getWall(r, c+1,'h'));
        }
        
        //const vertWallAbove = document.querySelector(`.wall-v[data-r='${r}'][data-c='${c}']`);
        disableWall(getWall(r, c,'v'));
        
    } else if (type === 'wall-v') {
        if (r > 0) {
            //const prevWall = document.querySelector(`.wall-v[data-r='${r - 1}'][data-c='${c}']`);
            disableWall(getWall(r-1, c, 'v'));
        }
        
        if (r < 7) {
            //const nextWall = document.querySelector(`.wall-v[data-r='${r + 1}'][data-c='${c}']`);
            disableWall(getWall(r+1, c, 'v'));
        }
        
        //const horizWallLeft = document.querySelector(`.wall-h[data-r='${r}'][data-c='${c}']`);
        disableWall(getWall(r, c, 'h'));
    }
}

function handleWallClick(wallDiv) {
    if (wallDiv.classList.contains('placed') || wallDiv.classList.contains('disabled') || gameFinished) return;
    
    if(wall_cnt[game.getCurrentPlayer()-1]-1 < 0) {
      window.API.showInfobox('invalid move', 'you are out of walls !');
      return;
    }
    
    const type = wallDiv.dataset.type, r = wallDiv.dataset.r, c = wallDiv.dataset.c;

    if(!game.isLegalWallPlacement(r,c,type)) {
        window.API.showInfobox('illegal move', "walls can't be placed in such a way that traps either players");
        return;
    }
    
    document.getElementById(`p${game.getCurrentPlayer()}-walls`).textContent = `${--wall_cnt[game.getCurrentPlayer()-1]}`;
    game.makeWall(r,c,type);

    const walls = getWallGroup(wallDiv);
    walls.forEach(w => {
        w.classList.add('placed');
    });
    
    disableOverlappingWalls(wallDiv);
    clearWallHover();
    switchPlayer();
}

function handleReset() {
    document.querySelectorAll('.pawn').forEach(p => p.remove());
    document.querySelectorAll('.wall-slot, .wall-center').forEach(w => {
        w.classList.remove('placed');
        w.classList.remove('disabled');
        w.style.backgroundColor = '';
        w.style.cursor = '';
    });
    
    document.querySelectorAll('.wall-h').forEach(wall => {
        const c = parseInt(wall.dataset.c);
        if (c !== 8) {
            wall.onmouseenter = () => handleWallHover(wall);
            wall.onmouseleave = () => clearWallHover();
            wall.onclick = () => handleWallClick(wall);
        }
    });
    
    document.querySelectorAll('.wall-v').forEach(wall => {
        const r = parseInt(wall.dataset.r);
        if (r !== 8) {
            wall.onmouseenter = () => handleWallHover(wall);
            wall.onmouseleave = () => clearWallHover();
            wall.onclick = () => handleWallClick(wall);
        }
    });

    document.querySelectorAll('.clickable').forEach(cell => cell.classList.remove('clickable'));

    document.querySelectorAll('.wall-h[data-c="8"], .wall-v[data-r="8"]').forEach(wall => {
        wall.classList.add('disabled');
    });
    
    gameFinished = false;
    game = new Game();
    placePawn(0, 4, 'p2'); 
    placePawn(8, 4, 'p1'); 
    
    wall_cnt = [10, 10];
    document.getElementById('p2-walls').textContent = '10';
    document.getElementById('p1-walls').textContent = '10';

    legalMoves = game.getLegibleMoves();
    legalMoves.forEach((move) => {
      placePawn(...move, 'potential-move');
      getCell(...move).classList.add('clickable');
    });
    
}

function handleUndo() {
    console.log("Undo triggered");
}

function handleCellClick(cellDiv, override=false) {
    if (!cellDiv.classList.contains('clickable') && !override) {
        return;
    }
    
    const r = parseInt(cellDiv.dataset.r);
    const c = parseInt(cellDiv.dataset.c);
    
    if(r === 0 && game.getCurrentPlayer() === 1|| r === 8 && game.getCurrentPlayer() === 2) {
        window.API.showInfobox('game finished', `Player ${game.getCurrentPlayer()} wins !`);
        gameFinished = true;
    }

    game.makeMove(r, c);
    document.getElementsByClassName(`p${3-game.getCurrentPlayer()}`)[0].remove();
    placePawn(r, c, `p${3-game.getCurrentPlayer()}`);

    switchPlayer();
}

function switchPlayer() {
  document.querySelectorAll('.potential-move').forEach((p) => {
    p.parentElement.classList.remove('clickable');
    p.remove();
  });
  
  if(gameFinished) return;

    document.getElementById(`p${3-game.getCurrentPlayer()}-status`).classList.remove('active');
    document.getElementById(`p${game.getCurrentPlayer()}-status`).classList.add('active');
    document.getElementById('game-message').textContent = `Player ${game.getCurrentPlayer()}'s turn`;

    if(isAiEnabled && game.getCurrentPlayer() === 2) {
        let [t, r, c] = game.makeAiMove(window.AI_DEPTH);
        if(t === 'p') {
            handleCellClick(getCell(r, c), true); 
        }else {
            handleWallClick(getWall(r,c, t));
        }

    } else {
        legalMoves = game.getLegibleMoves();
        legalMoves.forEach((move) => {
            placePawn(...move, 'potential-move');
            getCell(...move).classList.add('clickable');
        });
    }
  
}

function getCell(r, c) {
  return document.querySelector(`.cell[data-r='${r}'][data-c='${c}']`);
}

function placePawn(r, c, playerClass) {
    const cell = getCell(r, c);

    if (cell) {
        const pawn = document.createElement('div');
        pawn.className = `pawn ${playerClass}`;
        cell.appendChild(pawn);
    }
}

aiToggle.addEventListener('change', (e) => {
    isAiEnabled = e.target.checked;
    if(isAiEnabled && game.getCurrentPlayer() === 2) {
        let [t, r, c] = game.makeAiMove(window.AI_DEPTH);
        if(t === 'p') {
            handleCellClick(getCell(r, c), true);
        }else {
            handleWallClick(getWall(r,c, t));
        }

    }
});

window.handleReset = handleReset;
// window.handleUndo = handleUndo;