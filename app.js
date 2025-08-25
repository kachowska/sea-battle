// Sea Battle demo — static JS (no build tools).
// Features: 10x10 grid, standard ships [5,4,3,3,2], drag & drop placement (optional),
// auto-place, turn-based play with "hit-streak", sunk reveal, basic AI, localStorage save.

const BOARD_SIZE = 10;
const SHIP_SIZES = [5,4,3,3,2]; // carrier, battleship, cruiser, submarine, destroyer

// --- State ---
let player = makeEmptyState('P');
let ai = makeEmptyState('AI');
let turn = 'P'; // P moves first
let phase = 'place'; // 'place' -> 'fight'
let orientationById = {}; // palette orientation memory

function makeEmptyState(prefix){
  return {
    board: Array.from({length:BOARD_SIZE}, _ => Array.from({length:BOARD_SIZE}, _ => ({ shipId:null, hit:false, miss:false }))),
    ships: SHIP_SIZES.map((size, idx) => ({ id: prefix+'-'+idx, size, coords:[], sunk:false })),
    hits:0, misses:0, sunk:0
  };
}

// --- Helpers ---
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
function coordKey(r,c){ return r+'_'+c }
function inBounds(r,c){ return r>=0 && r<BOARD_SIZE && c>=0 && c<BOARD_SIZE }
function canPlace(state, ship, r, c, orient){
  for(let i=0;i<ship.size;i++){
    const rr = r + (orient==='V'?i:0);
    const cc = c + (orient==='H'?i:0);
    if(!inBounds(rr,cc)) return false;
    if(state.board[rr][cc].shipId) return false;
    // optional: avoid adjacency (commented for simplicity)
    // for(let dr=-1; dr<=1; dr++) for(let dc=-1; dc<=1; dc++){
    //   const nr=rr+dr, nc=cc+dc; if(inBounds(nr,nc) && state.board[nr][nc].shipId) return false;
    // }
  }
  return true;
}
function placeShip(state, ship, r, c, orient){
  ship.coords = [];
  for(let i=0;i<ship.size;i++){
    const rr = r + (orient==='V'?i:0);
    const cc = c + (orient==='H'?i:0);
    state.board[rr][cc].shipId = ship.id;
    ship.coords.push({r:rr,c:cc});
  }
}
function randomInt(n){ return Math.floor(Math.random()*n) }
function randomPlaceAll(state){
  for(const ship of state.ships){
    let placed=false, attempts=0;
    while(!placed && attempts<1000){
      const orient = Math.random()<0.5? 'H':'V';
      const r = randomInt(BOARD_SIZE);
      const c = randomInt(BOARD_SIZE);
      if(canPlace(state, ship, r, c, orient)){
        placeShip(state, ship, r, c, orient);
        placed=true;
      }
      attempts++;
    }
    if(!placed) console.warn('Failed to place ship', ship.id);
  }
}

// --- Rendering ---
const playerBoardEl = $('#player-board');
const aiBoardEl = $('#ai-board');
function renderBoards(){
  renderBoard(playerBoardEl, player, false);
  renderBoard(aiBoardEl, ai, true);
  $('#p-hits').textContent = player.hits;
  $('#p-miss').textContent = player.misses;
  $('#p-sunk').textContent = player.sunk;
  $('#ai-hits').textContent = ai.hits;
  $('#ai-miss').textContent = ai.misses;
  $('#ai-sunk').textContent = ai.sunk;
}
function renderBoard(root, state, hideShips){
  root.innerHTML = '';
  root.style.setProperty('--size', BOARD_SIZE);
  root.classList.add('board');
  for(let r=0;r<BOARD_SIZE;r++){
    for(let c=0;c<BOARD_SIZE;c++){
      const cell = state.board[r][c];
      const div = document.createElement('div');
      div.className = 'cell';
      div.dataset.r = r; div.dataset.c = c;
      const hasShip = !!cell.shipId;
      if(hasShip && !hideShips) div.classList.add('ship');
      if(cell.hit) div.classList.add('hit');
      if(cell.miss) div.classList.add('miss');
      if(hideShips){
        div.addEventListener('click', onShootAI);
      }
      root.appendChild(div);
    }
  }
}

function revealSunk(state, opponentBoardEl){
  // after a sink, mark all ship cells as ship (even on enemy board) so it's visible
  // Rendering already shows sunk as hit; here we could add a subtle class, but keep it simple.
}

function checkSunk(state, shipId){
  const ship = state.ships.find(s => s.id === shipId);
  if(!ship) return false;
  const sunk = ship.coords.every(({r,c}) => state.board[r][c].hit);
  if(sunk && !ship.sunk){
    ship.sunk = true;
    state.sunk++;
    return true;
  }
  return sunk;
}

// --- Shooting logic ---
let aiTargets = new Set(); // basic memory to not repeat
let aiHunt = []; // simple hunt list around last hit

function onShootAI(e){
  if(phase !== 'fight' || turn !== 'P') return;
  const r = +e.currentTarget.dataset.r;
  const c = +e.currentTarget.dataset.c;
  const cell = ai.board[r][c];
  if(cell.hit || cell.miss) return; // already tried

  const isHit = !!cell.shipId;
  if(isHit){
    cell.hit = true;
    player.hits++;
    if(checkSunk(ai, cell.shipId)){
      // reveal sunk handled via CSS by hits on all cells
    }
    renderBoards();
    saveState();
    // Player shoots again on hit
    if(ai.sunk === ai.ships.length){
      endGame('You win!');
      return;
    }
  }else{
    cell.miss = true;
    player.misses++;
    renderBoards();
    saveState();
    // switch to AI
    turn = 'AI';
    setTimeout(aiMove, 500);
  }
}

function aiMove(){
  if(phase !== 'fight' || turn !== 'AI') return;
  // naive AI with tiny "hunt" logic
  let r,c;
  if(aiHunt.length){
    const t = aiHunt.pop();
    r = t.r; c = t.c;
  }else{
    do { r = randomInt(BOARD_SIZE); c = randomInt(BOARD_SIZE); } while(player.board[r][c].hit || player.board[r][c].miss);
  }
  const cell = player.board[r][c];
  const isHit = !!cell.shipId;
  if(isHit){
    cell.hit = true;
    ai.hits++;
    if(checkSunk(player, cell.shipId)){
      // clear hunt if ship sunk
      aiHunt = [];
    }else{
      // enqueue neighbors
      const neigh = [[1,0],[-1,0],[0,1],[0,-1]];
      for(const [dr,dc] of neigh){
        const rr=r+dr, cc=c+dc;
        if(inBounds(rr,cc) && !player.board[rr][cc].hit && !player.board[rr][cc].miss){
          aiHunt.push({r:rr,c:cc});
        }
      }
    }
    renderBoards();
    saveState();
    if(player.sunk === player.ships.length){
      endGame('AI wins!');
      return;
    }
    // AI shoots again on hit
    setTimeout(aiMove, 500);
  }else{
    cell.miss = true;
    ai.misses++;
    renderBoards();
    saveState();
    turn = 'P';
  }
}

// --- Placement (drag & drop) ---
const paletteEl = $('#ship-palette');
function makePalette(){
  paletteEl.innerHTML = '';
  for(const ship of player.ships){
    const piece = document.createElement('div');
    piece.className = 'ship-piece';
    const orient = orientationById[ship.id] || 'H';
    piece.dataset.orient = orient;
    piece.dataset.shipId = ship.id;
    piece.draggable = true;
    piece.title = 'Click to rotate; drag onto your board';
    piece.addEventListener('click', ()=>{
      piece.dataset.orient = piece.dataset.orient === 'H' ? 'V' : 'H';
      orientationById[ship.id] = piece.dataset.orient;
      renderPieceCells(piece, ship.size);
    });
    piece.addEventListener('dragstart', onDragStart);
    renderPieceCells(piece, ship.size);
    paletteEl.appendChild(piece);
  }
}
function renderPieceCells(piece, size){
  piece.innerHTML = '';
  for(let i=0;i<size;i++){
    const cell = document.createElement('div');
    cell.className='ship-cell';
    piece.appendChild(cell);
  }
}
function onDragStart(e){
  const shipId = e.currentTarget.dataset.shipId;
  const orient = e.currentTarget.dataset.orient;
  e.dataTransfer.setData('text/plain', JSON.stringify({shipId, orient}));
}

function enableBoardDnD(){
  $$('#player-board .cell').forEach(cell => {
    cell.addEventListener('dragover', e => {
      e.preventDefault();
      const data = safeParseDT(e);
      if(!data) return;
      const r = +cell.dataset.r, c=+cell.dataset.c;
      const ship = player.ships.find(s=>s.id===data.shipId);
      clearHover();
      const ok = canPlace(player, ship, r, c, data.orient);
      markHover(r,c,ship.size,data.orient, ok);
    });
    cell.addEventListener('dragleave', clearHover);
    cell.addEventListener('drop', e => {
      e.preventDefault();
      const data = safeParseDT(e);
      if(!data) return;
      const r = +cell.dataset.r, c=+cell.dataset.c;
      const ship = player.ships.find(s=>s.id===data.shipId);
      if(canPlace(player, ship, r, c, data.orient)){
        placeShip(player, ship, r, c, data.orient);
        // remove from palette
        const el = paletteEl.querySelector(`[data-ship-id="${ship.id}"]`);
        el?.remove();
        renderBoards();
        enableBoardDnD();
        checkPlacementReady();
        saveState();
      }
      clearHover();
    });
  });
}
function safeParseDT(e){
  try { return JSON.parse(e.dataTransfer.getData('text/plain')); } catch{ return null }
}
function markHover(r,c,size,orient,ok){
  for(let i=0;i<size;i++){
    const rr = r + (orient==='V'?i:0);
    const cc = c + (orient==='H'?i:0);
    const cell = $(`#player-board .cell[data-r="${rr}"][data-c="${cc}"]`);
    if(cell) cell.classList.add(ok?'hover-valid':'hover-invalid');
  }
}
function clearHover(){
  $$('#player-board .cell').forEach(cell => cell.classList.remove('hover-valid','hover-invalid'));
}
function checkPlacementReady(){
  const placedCount = player.ships.filter(s => s.coords.length>0).length;
  if(placedCount === SHIP_SIZES.length){
    phase = 'fight';
    turn = 'P';
    // lock player board (no more DnD listeners)
    $$('#player-board .cell').forEach(cell => {
      cell.replaceWith(cell.cloneNode(true));
    });
  }
}

// --- Save/Load ---
function saveState(){
  const payload = { player, ai, turn, phase };
  localStorage.setItem('sea-battle-demo', JSON.stringify(payload));
}
function loadState(){
  const raw = localStorage.getItem('sea-battle-demo');
  if(!raw) return false;
  try{
    const data = JSON.parse(raw);
    player = data.player; ai = data.ai; turn = data.turn; phase = data.phase;
    return true;
  }catch{ return false }
}
function clearSave(){
  localStorage.removeItem('sea-battle-demo');
}

// --- End game dialog ---
const dialog = document.getElementById('end-dialog');
function endGame(title){
  phase = 'end';
  $('#end-title').textContent = title;
  $('#end-summary').textContent = `Your hits: ${player.hits}, misses: ${player.misses}. AI hits: ${ai.hits}, misses: ${ai.misses}.`;
  saveState();
  dialog.showModal();
}
$('#btn-restart').addEventListener('click', ()=>{
  dialog.close();
  newGame();
});
$('#btn-close').addEventListener('click', ()=> dialog.close());

// --- Controls ---
$('#btn-new').addEventListener('click', newGame);
$('#btn-autoplace').addEventListener('click', ()=>{
  if(phase!=='place') return;
  // Clear current placement
  player = makeEmptyState('P');
  randomPlaceAll(player);
  renderBoards();
  makePalette(); // palette will show remaining (none if all placed)
  paletteEl.innerHTML = '<em>All ships placed. You can start firing on the enemy board.</em>';
  phase='fight';
  turn='P';
  saveState();
});
$('#btn-save').addEventListener('click', saveState);
$('#btn-clear').addEventListener('click', ()=>{ clearSave(); alert('Saved game cleared.'); });

function newGame(){
  player = makeEmptyState('P');
  ai = makeEmptyState('AI');
  randomPlaceAll(ai);
  turn = 'P';
  phase = 'place';
  renderBoards();
  makePalette();
  enableBoardDnD();
  saveState();
}

// --- Boot ---
if(!loadState()){
  newGame();
}else{
  renderBoards();
  makePalette();
  enableBoardDnD();
}
