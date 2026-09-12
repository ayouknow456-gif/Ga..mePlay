(() => {
  const HISTORY_KEY = 'pwy_police_history_v1';

  let players = [];
  let policeCount = 1;
  let lastAssignment = null; // {name: 'police'|'thief'}

  const setupView = document.getElementById('setupView');
  const resultView = document.getElementById('resultView');
  const nameInput = document.getElementById('nameInput');
  const addBtn = document.getElementById('addBtn');
  const chipList = document.getElementById('chipList');
  const countHint = document.getElementById('countHint');
  const decBtn = document.getElementById('decBtn');
  const incBtn = document.getElementById('incBtn');
  const policeVal = document.getElementById('policeVal');
  const randomBtn = document.getElementById('randomBtn');
  const clearAllBtn = document.getElementById('clearAllBtn');
  const revealGrid = document.getElementById('revealGrid');
  const reRollBtn = document.getElementById('reRollBtn');
  const backToSetupBtn = document.getElementById('backToSetupBtn');

  function loadHistory(){
    try{ return JSON.parse(localStorage.getItem(HISTORY_KEY)) || {}; }
    catch(e){ return {}; }
  }
  function saveHistory(h){
    try{ localStorage.setItem(HISTORY_KEY, JSON.stringify(h)); }catch(e){}
  }

  function renderChips(){
    chipList.innerHTML = '';
    players.forEach((n, i) => {
      const chip = document.createElement('div');
      chip.className = 'chip';
      chip.innerHTML = `<span>${escapeHtml(n)}</span>`;
      const rm = document.createElement('button');
      rm.textContent = '×';
      rm.onclick = () => { players.splice(i,1); PWY.click(); afterPlayersChanged(); };
      chip.appendChild(rm);
      chipList.appendChild(chip);
    });
    countHint.textContent = players.length === 0 ? 'ยังไม่มีผู้เล่น' : `ผู้เล่นทั้งหมด ${players.length} คน`;
    clampPoliceCount();
    randomBtn.disabled = players.length < 3;
  }

  function escapeHtml(s){ const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  function clampPoliceCount(){
    const max = Math.max(1, players.length - 1);
    if(policeCount > max) policeCount = max;
    if(policeCount < 1) policeCount = 1;
    policeVal.textContent = policeCount;
  }

  function afterPlayersChanged(){ renderChips(); }

  function addPlayer(){
    const v = nameInput.value.trim();
    if(!v) return;
    if(players.includes(v)){ nameInput.value=''; return; }
    players.push(v);
    nameInput.value = '';
    PWY.pop();
    afterPlayersChanged();
    nameInput.focus();
  }

  addBtn.addEventListener('click', addPlayer);
  nameInput.addEventListener('keydown', (e) => { if(e.key === 'Enter') addPlayer(); });
  clearAllBtn.addEventListener('click', () => { players = []; PWY.click(); afterPlayersChanged(); });

  decBtn.addEventListener('click', () => { PWY.click(); policeCount--; clampPoliceCount(); });
  incBtn.addEventListener('click', () => { PWY.click(); policeCount++; clampPoliceCount(); });

  // weighted sampling without replacement — fewer past "police" turns = higher chance
  function pickPolice(names, k){
    const history = loadHistory();
    const pool = names.map(n => ({ name:n, weight: 1/(1+(history[n]||0)) }));
    const chosen = [];
    for(let i=0;i<k && pool.length>0;i++){
      const totalW = pool.reduce((s,p)=>s+p.weight,0);
      let r = Math.random()*totalW;
      let idx = 0;
      for(; idx<pool.length; idx++){
        r -= pool[idx].weight;
        if(r <= 0) break;
      }
      idx = Math.min(idx, pool.length-1);
      chosen.push(pool[idx].name);
      pool.splice(idx,1);
    }
    return chosen;
  }

  function assignRoles(){
    const policeNames = pickPolice(players, policeCount);
    const assignment = {};
    players.forEach(n => { assignment[n] = policeNames.includes(n) ? 'police' : 'thief'; });

    // update history
    const history = loadHistory();
    policeNames.forEach(n => { history[n] = (history[n]||0) + 1; });
    saveHistory(history);

    lastAssignment = assignment;
    return assignment;
  }

  function renderResults(assignment){
    revealGrid.innerHTML = '';
    // shuffle display order so position doesn't reveal role
    const order = [...players].sort(() => Math.random() - 0.5);
    order.forEach(name => {
      const role = assignment[name];
      const card = document.createElement('div');
      card.className = 'reveal-card';
      card.innerHTML = `
        <div class="face front">
          <div class="role-icon">❔</div>
          <div class="name">${escapeHtml(name)}</div>
          <div class="tap-hint">แตะเพื่อดูบทบาท</div>
        </div>
        <div class="face back ${role}">
          <div class="role-icon">${role==='police' ? '👮' : '🥷'}</div>
          <div class="role-name">${role==='police' ? 'ตำรวจ' : 'โจร'}</div>
          <div class="name">${escapeHtml(name)}</div>
        </div>
      `;
      let hideTimer = null;
      card.addEventListener('click', () => {
        PWY.click();
        card.classList.toggle('flipped');
        if(card.classList.contains('flipped')){
          hideTimer = setTimeout(() => card.classList.remove('flipped'), 2600);
        }else if(hideTimer){
          clearTimeout(hideTimer);
        }
      });
      revealGrid.appendChild(card);
    });
  }

  randomBtn.addEventListener('click', () => {
    if(players.length < 3) return;
    PWY.fanfare();
    const assignment = assignRoles();
    setupView.classList.remove('active');
    resultView.classList.add('active');
    renderResults(assignment);
  });

  reRollBtn.addEventListener('click', () => {
    PWY.click();
    const assignment = assignRoles();
    renderResults(assignment);
    PWY.fanfare();
  });

  backToSetupBtn.addEventListener('click', () => {
    PWY.click();
    resultView.classList.remove('active');
    setupView.classList.add('active');
  });

  renderChips();
})();
