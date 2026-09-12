(() => {
  let players = [];
  let lastAssignment = null;

  const setupView    = document.getElementById('setupView');
  const confirmView  = document.getElementById('confirmView');
  const resultView   = document.getElementById('resultView');

  const nameInput    = document.getElementById('nameInput');
  const addBtn       = document.getElementById('addBtn');
  const chipList     = document.getElementById('chipList');
  const countHint    = document.getElementById('countHint');
  const nextBtn      = document.getElementById('nextBtn');
  const clearAllBtn  = document.getElementById('clearAllBtn');

  const confirmSummary = document.getElementById('confirmSummary');
  const roleBreakdown  = document.getElementById('roleBreakdown');
  const assignBtn      = document.getElementById('assignBtn');
  const backBtn        = document.getElementById('backBtn');

  const resultGrid  = document.getElementById('resultGrid');
  const reRollBtn   = document.getElementById('reRollBtn');
  const editBtn     = document.getElementById('editBtn');

  // ===== บทบาททั้งหมด =====
  const ROLES = {
    // ─── ฝั่งดี (Crewmate) ───
    innocent:   { icon:'🙂', name:'ผู้บริสุทธิ์',    side:'crew',    cls:'crew',    desc:'ทำภารกิจและช่วยหาคนร้าย',                    weight:100 },
    sheriff:    { icon:'⭐', name:'นายอำเภอ',        side:'crew',    cls:'sheriff', desc:'ยิงคนร้ายได้ทันที (ระวังยิงผิด)',              weight:60  },
    doctor:     { icon:'💉', name:'หมอ',             side:'crew',    cls:'doctor',  desc:'ชุบชีวิตเพื่อนที่ถูกฆ่ากลับมาได้',            weight:55  },
    detective:  { icon:'🔍', name:'นักสืบ',          side:'crew',    cls:'crew',    desc:'สะกดรอยหาตำแหน่งคนร้าย',                     weight:40  },
    guardian:   { icon:'🛡️', name:'ผู้พิทักษ์',     side:'crew',    cls:'crew',    desc:'สร้างเกราะปกป้องเพื่อนจากการถูกฆ่า',          weight:38  },
    engineer:   { icon:'🔧', name:'วิศวกร',          side:'crew',    cls:'crew',    desc:'เข้าท่อเดินทางไวและซ่อมระบบ',                 weight:35  },
    seer:       { icon:'🔮', name:'ร่างทรง',         side:'crew',    cls:'crew',    desc:'ตรวจสอบวิญญาณเพื่อหาสาเหตุการตาย',           weight:30  },
    spy_crew:   { icon:'🕵️‍♂️', name:'สายลับ',      side:'crew',    cls:'crew',    desc:'ปลอมตัวเข้ากลุ่มคนร้ายเพื่อหาข่าว',           weight:28  },
    trapper:    { icon:'🪤', name:'คนวางกับดัก',    side:'crew',    cls:'crew',    desc:'ดักจับและเปิดเผยตำแหน่งคนร้าย',               weight:25  },
    hacker:     { icon:'💻', name:'แฮกเกอร์',       side:'crew',    cls:'crew',    desc:'ดูข้อมูลการเคลื่อนไหวของทุกคน',               weight:22  },
    scout:      { icon:'🔭', name:'คนลาดตระเวน',   side:'crew',    cls:'crew',    desc:'สอดส่องพื้นที่ระยะไกล',                       weight:20  },
    plumber:    { icon:'🪠', name:'ช่างท่อ',        side:'crew',    cls:'crew',    desc:'อุดท่อไม่ให้คนร้ายใช้เดินทาง',                weight:18  },
    timemaster: { icon:'⏳', name:'จ้าวแห่งเวลา',  side:'crew',    cls:'crew',    desc:'ย้อนเวลายกเลิกเหตุการณ์ฆาตกรรม',             weight:12  },
    veteran:    { icon:'🎖️', name:'ทหารผ่านศึก',   side:'crew',    cls:'crew',    desc:'สวนกลับทันทีถ้าถูกโจมตีช่วงระวังภัย',         weight:15  },

    // ─── ฝั่งทรยศ (Impostor) ───
    impostor:   { icon:'🔪', name:'คนทรยศ',         side:'bad',     cls:'spy',     desc:'ลอบสังหารและก่อกวนระบบ',                      weight:100 },
    morphling:  { icon:'🕵️', name:'ตัวแฝง',        side:'bad',     cls:'spy',     desc:'ปลอมตัวเป็นบทบาทอื่นเพื่อพรางตัว',            weight:55  },
    vampire:    { icon:'🧛', name:'แวมไพร์',        side:'bad',     cls:'spy',     desc:'กัดแล้วปล่อยพิษทำงานทีหลัง',                 weight:35  },
    chameleon:  { icon:'🦎', name:'กิ้งก่าพรางตัว', side:'bad',     cls:'spy',     desc:'ล่องหนไปกับสภาพแวดล้อมช่วงหนึ่ง',             weight:28  },
    swooper:    { icon:'👻', name:'ล่องหน',         side:'bad',     cls:'spy',     desc:'หายตัวเข้าออกพื้นที่ได้อิสระ',                weight:25  },
    janitor:    { icon:'🧹', name:'คนทำความสะอาด', side:'bad',     cls:'spy',     desc:'กำจัดศพเพื่อทำลายหลักฐาน',                    weight:22  },
    puppeteer:  { icon:'🪆', name:'นักเชิดหุ่น',   side:'bad',     cls:'spy',     desc:'ควบคุมคนอื่นให้ไปทำร้ายเพื่อน',               weight:18  },
    wizard:     { icon:'🧙‍♂️', name:'ผู้วิเศษ',     side:'bad',     cls:'spy',     desc:'สั่งฆ่าเป้าหมายจากระยะไกล',                   weight:15  },
    bounty:     { icon:'🎯', name:'นักล่าค่าหัว',  side:'bad',     cls:'spy',     desc:'มีเป้าหมายเฉพาะ ฆ่าสำเร็จ→ คูลดาวน์ลด',       weight:20  },
    witch:      { icon:'🧹', name:'แม่มด',          side:'bad',     cls:'spy',     desc:'สาปให้ตายตอนประชุม',                          weight:12  },

    // ─── ฝั่งกลาง (Neutral) ───
    jester:     { icon:'🤡', name:'ตัวตลก',         side:'neutral', cls:'neutral', desc:'ป่วนให้ทุกคนโหวตตัวเองออก → ชนะทันที',        weight:30  },
    arsonist:   { icon:'🔥', name:'คนวางเพลิง',     side:'neutral', cls:'neutral', desc:'ราดน้ำมันทุกคนแล้วจุดไฟพร้อมกัน',             weight:22  },
    hypnotist:  { icon:'🌀', name:'นักสะกดจิต',     side:'neutral', cls:'neutral', desc:'เปลี่ยนฝ่ายผู้เล่นอื่นมาอยู่ฝ่ายตัวเอง',      weight:18  },
    survivor:   { icon:'🎒', name:'ผู้รอดชีวิต',    side:'neutral', cls:'neutral', desc:'รอดจนจบเกมไม่ว่าจะเกิดอะไรขึ้น',              weight:25  },
    phantom:    { icon:'👤', name:'วิญญาณ',         side:'neutral', cls:'neutral', desc:'ถูกโหวตออก→ทำภารกิจวิญญาณให้ครบเพื่อชนะ',     weight:15  },
  };

  // ===== logic สุ่มบทบาท =====
  function pickWeighted(pool){
    const total = pool.reduce((s,r)=>s+ROLES[r].weight,0);
    let r = Math.random()*total;
    for(const k of pool){ r -= ROLES[k].weight; if(r<=0) return k; }
    return pool[pool.length-1];
  }

  function computeRolePlan(n){
    // ── จำนวนคนร้าย ──
    const badCount = n<=5 ? 1 : n<=8 ? 2 : n<=11 ? 3 : 4;
    // ── ตัวกลาง: ยากมาก โอกาส ~20% ต่อสล็อต แต่ไม่เกิน 1 คนถ้ามีน้อย ──
    let neutralCount = 0;
    if(n>=6){
      const maxNeutral = Math.floor((n-badCount)/4);
      for(let i=0;i<maxNeutral;i++){ if(Math.random()<0.20) neutralCount++; }
    }
    const crewCount = n - badCount - neutralCount;
    return { badCount, neutralCount, crewCount };
  }

  function assignRoles(){
    const n = players.length;
    const { badCount, neutralCount, crewCount } = computeRolePlan(n);

    const crewPool    = Object.keys(ROLES).filter(k=>ROLES[k].side==='crew');
    const badPool     = Object.keys(ROLES).filter(k=>ROLES[k].side==='bad');
    const neutralPool = Object.keys(ROLES).filter(k=>ROLES[k].side==='neutral');

    const picked = { crew:[], bad:[], neutral:[] };

    // ── ฝั่งดี: innocent เสมอ 1 ที่ ที่เหลือสุ่ม ──
    picked.crew.push('innocent');
    const crewExtra = [...crewPool.filter(k=>k!=='innocent')];
    for(let i=1;i<crewCount;i++){
      if(!crewExtra.length){ picked.crew.push('innocent'); continue; }
      const idx = crewExtra.findIndex(k=>k===pickWeighted(crewExtra));
      picked.crew.push(crewExtra.splice(idx,1)[0]);
    }

    // ── ฝั่งร้าย: impostor เสมอ 1 ที่ ──
    picked.bad.push('impostor');
    const badExtra = [...badPool.filter(k=>k!=='impostor')];
    for(let i=1;i<badCount;i++){
      if(!badExtra.length){ picked.bad.push('impostor'); continue; }
      const idx = badExtra.findIndex(k=>k===pickWeighted(badExtra));
      picked.bad.push(badExtra.splice(idx,1)[0]);
    }

    // ── ฝั่งกลาง ──
    const neuExtra = [...neutralPool];
    for(let i=0;i<neutralCount;i++){
      if(!neuExtra.length) break;
      const idx = neuExtra.findIndex(k=>k===pickWeighted(neuExtra));
      picked.neutral.push(neuExtra.splice(idx,1)[0]);
    }

    const allRoles = [...picked.crew, ...picked.bad, ...picked.neutral]
      .sort(()=>Math.random()-0.5);
    const shuffled = [...players].sort(()=>Math.random()-0.5);

    const assignment = {};
    shuffled.forEach((name,i)=>{ assignment[name] = allRoles[i]; });
    lastAssignment = assignment;
    return { assignment, plan:{ badCount, neutralCount, crewCount } };
  }

  // ===== UI helpers =====
  function escapeHtml(s){ const d=document.createElement('div');d.textContent=s;return d.innerHTML; }

  function renderChips(){
    chipList.innerHTML='';
    players.forEach((n,i)=>{
      const chip=document.createElement('div');
      chip.className='chip';
      chip.innerHTML=`<span>${escapeHtml(n)}</span>`;
      const rm=document.createElement('button');
      rm.textContent='×';
      rm.onclick=()=>{ players.splice(i,1); PWY.click(); renderChips(); };
      chip.appendChild(rm);
      chipList.appendChild(chip);
    });
    countHint.textContent = players.length===0
      ? 'ยังไม่มีผู้เล่น (ต้องการอย่างน้อย 4 คน)'
      : players.length<4
        ? `มี ${players.length} คน — ต้องการอีก ${4-players.length} คน`
        : `มี ${players.length} คน ✅ พร้อมเริ่มเกม`;
    nextBtn.disabled = players.length<4;
  }

  function addPlayer(){
    const v=nameInput.value.trim();
    if(!v) return;
    if(players.includes(v)){ nameInput.value=''; return; }
    players.push(v);
    nameInput.value='';
    PWY.pop();
    renderChips();
    nameInput.focus();
  }

  addBtn.addEventListener('click',addPlayer);
  nameInput.addEventListener('keydown',(e)=>{ if(e.key==='Enter') addPlayer(); });
  clearAllBtn.addEventListener('click',()=>{ players=[]; PWY.click(); renderChips(); });

  function showBreakdown(){
    const n = players.length;
    const { badCount, neutralCount, crewCount } = computeRolePlan(n);
    confirmSummary.textContent=`ผู้เล่นทั้งหมด ${n} คน`;
    const neutralNote = neutralCount===0
      ? `<span class="role-pill" style="opacity:.55">🎭 กลาง × ? <span style="font-size:11px">(โอกาสต่ำมาก)</span></span>`
      : `<span class="role-pill neutral-pill">🎭 กลาง × ${neutralCount}</span>`;
    roleBreakdown.innerHTML=`
      <span class="role-pill crew-pill">✅ ดี × ${crewCount}</span>
      <span class="role-pill bad-pill">🔪 ร้าย × ${badCount}</span>
      ${neutralNote}
    `;
  }

  nextBtn.addEventListener('click',()=>{
    if(players.length<4) return;
    PWY.click();
    showBreakdown();
    setupView.classList.remove('active');
    confirmView.classList.add('active');
  });

  backBtn.addEventListener('click',()=>{
    PWY.click();
    confirmView.classList.remove('active');
    setupView.classList.add('active');
  });

  function renderResults({ assignment, plan }){
    resultGrid.innerHTML='';
    // summary bar
    const summaryEl = document.getElementById('roleSummaryBar');
    if(summaryEl){
      summaryEl.innerHTML=`
        <span class="role-pill crew-pill">✅ ดี × ${plan.crewCount}</span>
        <span class="role-pill bad-pill">🔪 ร้าย × ${plan.badCount}</span>
        ${plan.neutralCount>0?`<span class="role-pill neutral-pill">🎭 กลาง × ${plan.neutralCount}</span>`:''}
      `;
    }
    players.forEach((name,i)=>{
      const roleKey = assignment[name];
      const meta = ROLES[roleKey];
      const card = document.createElement('div');
      card.className=`role-card ${meta.cls}`;
      card.style.animationDelay=`${i*0.07}s`;
      card.innerHTML=`
        <div class="role-icon">${meta.icon}</div>
        <div class="name">${escapeHtml(name)}</div>
        <div class="role-name">${meta.name}</div>
        <div class="role-side-badge side-${meta.side}">${
          meta.side==='crew'?'ฝ่ายดี':meta.side==='bad'?'ฝ่ายร้าย':'กลาง'
        }</div>
        <div class="role-desc">${meta.desc}</div>
      `;
      resultGrid.appendChild(card);
    });
  }

  let lastPlan = null;
  assignBtn.addEventListener('click',()=>{
    PWY.fanfare();
    const result = assignRoles();
    lastPlan = result.plan;
    confirmView.classList.remove('active');
    resultView.classList.add('active');
    renderResults(result);
  });

  reRollBtn.addEventListener('click',()=>{
    PWY.click();
    const result = assignRoles();
    lastPlan = result.plan;
    renderResults(result);
    PWY.fanfare();
  });

  editBtn.addEventListener('click',()=>{
    PWY.click();
    resultView.classList.remove('active');
    setupView.classList.add('active');
  });

  renderChips();
})();
