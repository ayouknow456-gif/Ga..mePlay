(() => {
  const PALETTE = ['#FFC93C','#FF5E9E','#3FE0C5','#5FA8FF','#FF8C42','#B784FF','#FF4D5E','#4CD964'];

  let names = [];
  let wheelAngle = 0;   // องศาที่วงล้อหมุนไปแล้ว (วงล้อหมุน เข็มอยู่กับที่ด้านบน)
  let spinning = false;
  let lastWinnerIndex = null;

  const setupView   = document.getElementById('setupView');
  const wheelView   = document.getElementById('wheelView');
  const nameInput   = document.getElementById('nameInput');
  const addBtn      = document.getElementById('addBtn');
  const chipList    = document.getElementById('chipList');
  const countHint   = document.getElementById('countHint');
  const wheelCountHint = document.getElementById('wheelCountHint');
  const startSpinBtn = document.getElementById('startSpinBtn');
  const clearAllBtn = document.getElementById('clearAllBtn');
  const spinBtn     = document.getElementById('spinBtn');
  const editNamesBtn = document.getElementById('editNamesBtn');
  const canvas      = document.getElementById('wheelCanvas');
  const ctx         = canvas.getContext('2d');
  const resultModal = document.getElementById('resultModal');
  const winnerText  = document.getElementById('winnerText');
  const removeOptionBtn = document.getElementById('removeOptionBtn');
  const restartBtn  = document.getElementById('restartBtn');
  const okBtn       = document.getElementById('okBtn');

  // ── วาดวงล้อที่ wheelAngle องศา (เข็มอยู่บนสุด = 12 นาฬิกา) ──
  function drawWheel(){
    const n = names.length;
    if(n === 0) return;
    const w = canvas.width, h = canvas.height;
    const cx = w/2, cy = h/2, r = w/2 - 8;
    ctx.clearRect(0,0,w,h);

    const seg = (Math.PI*2)/n;
    // offset: วงล้อเริ่มที่ -90° แล้วบวก wheelAngle ที่หมุนไป
    const offset = (-Math.PI/2) + (wheelAngle * Math.PI/180);

    for(let i=0;i<n;i++){
      const start = offset + i*seg;
      const end   = start + seg;

      // sector
      ctx.beginPath();
      ctx.moveTo(cx,cy);
      ctx.arc(cx,cy,r,start,end);
      ctx.closePath();
      ctx.fillStyle = PALETTE[i % PALETTE.length];
      ctx.fill();
      ctx.strokeStyle = 'rgba(15,8,33,0.3)';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // label — อยู่กึ่งกลาง sector
      const midAngle = start + seg/2;
      ctx.save();
      ctx.translate(cx,cy);
      ctx.rotate(midAngle);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#170B2E';
      const fs = Math.max(13, Math.min(24, 240/n));
      ctx.font = `700 ${fs}px Kanit, sans-serif`;
      let label = names[i];
      if(label.length > 11) label = label.slice(0,10)+'…';
      ctx.fillText(label, r - 14, 0);
      ctx.restore();
    }

    // highlight strip ตรงเข็ม (บนสุด)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx,cy);
    ctx.arc(cx,cy,r,-Math.PI/2 - 0.04,-Math.PI/2 + 0.04);
    ctx.closePath();
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  }

  // ── คำนวณ index ที่หยุดใต้เข็ม (เข็ม = องศา 0 / 12 นาฬิกา) ──
  function indexAtPointer(){
    const n = names.length;
    const seg = 360/n;
    // ตำแหน่งที่เข็มชี้คือองศา 0° ของวงล้อที่หมุนไปแล้ว
    // วงล้อเริ่มแรก: ชื่อ[0] อยู่ที่ -90° ถึง -90°+seg
    // หลังหมุน wheelAngle: ชื่อ[i] อยู่ที่ -90°+i*seg+wheelAngle ถึง ...
    // เข็มชี้ที่ -90° (12 นาฬิกา) = normalAngle ของวงล้อ
    const norm = ((-(wheelAngle % 360)) + 360) % 360;
    return Math.floor(norm / seg) % n;
  }

  function easeOutQuint(t){ return 1 - Math.pow(1-t,5); }

  function spin(){
    if(spinning || names.length < 2) return;
    spinning = true;
    spinBtn.disabled = true;
    editNamesBtn.disabled = true;

    const n = names.length;
    const seg = 360/n;

    // สุ่มผู้ชนะ
    const winnerIndex = Math.floor(Math.random() * n);
    lastWinnerIndex = winnerIndex;

    // หมุนให้ชื่อ[winnerIndex] หยุดตรงเข็ม (12 นาฬิกา)
    // ชื่อ[winnerIndex] เริ่มที่ -(90) + winnerIndex*seg (องศาตามรอบเดิมของวงล้อ)
    // เราอยากให้กึ่งกลาง segment นั้นหยุดที่ -90° (ใต้เข็ม)
    // => wheelAngle ใหม่ต้องทำให้: (winnerIndex*seg + seg/2) + wheelAngle ≡ 0 (mod 360) [เผื่อ offset -90 ตัดทิ้งสองฝั่ง]
    // วาดที่ offset = -90 + wheelAngle ดังนั้น midAngle ของ[winner] = -90 + winnerIndex*seg + seg/2 + wheelAngle
    // อยากให้ midAngle = -90 (เข็มบน) → winnerIndex*seg + seg/2 + wheelAngle ≡ 0 (mod 360)
    const jitter = (Math.random()-0.5) * seg * 0.55;
    const target = (-(winnerIndex*seg + seg/2 + jitter) % 360 + 360) % 360;

    const currentMod = ((wheelAngle % 360) + 360) % 360;
    let diff = ((target - currentMod) + 360) % 360;
    if(diff < 10) diff += 360; // ให้หมุนอย่างน้อย 1 รอบเสมอ

    const extraSpins = (6 + Math.floor(Math.random()*3)) * 360;
    const startAngle = wheelAngle;
    const finalAngle = wheelAngle + extraSpins + diff;
    const duration   = 4200 + Math.random()*600;

    let lastTickIdx = indexAtPointer();
    const startTime = performance.now();

    function frame(now){
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed/duration);
      wheelAngle = startAngle + (finalAngle - startAngle)*easeOutQuint(t);
      drawWheel();

      const curIdx = indexAtPointer();
      if(curIdx !== lastTickIdx){
        lastTickIdx = curIdx;
        PWY.tick();
      }

      if(t < 1){
        requestAnimationFrame(frame);
      } else {
        spinning = false;
        spinBtn.disabled = false;
        editNamesBtn.disabled = false;
        onSpinFinished(winnerIndex);
      }
    }
    requestAnimationFrame(frame);
  }

  function onSpinFinished(winnerIndex){
    PWY.fanfare();
    const name = names[winnerIndex];
    winnerText.textContent = `ผู้โชคดีคือ "${name}"`;
    resultModal.style.display = 'flex';
    PWY.speak(`ผู้โชคดีคือ ${name}`, {rate:1});
  }

  // ── UI helpers ──
  function escapeHtml(s){ const d=document.createElement('div');d.textContent=s;return d.innerHTML; }

  function renderChips(){
    chipList.innerHTML='';
    names.forEach((n,i)=>{
      const chip=document.createElement('div');
      chip.className='chip';
      chip.innerHTML=`<span>${escapeHtml(n)}</span>`;
      const rm=document.createElement('button');
      rm.textContent='×';
      rm.setAttribute('aria-label','ลบ '+n);
      rm.onclick=()=>{ names.splice(i,1); PWY.click(); renderChips(); };
      chip.appendChild(rm);
      chipList.appendChild(chip);
    });
    countHint.textContent = names.length===0
      ? 'ยังไม่มีชื่อในวงล้อ'
      : `มีทั้งหมด ${names.length} ชื่อในวงล้อ`;
    startSpinBtn.disabled = names.length < 2;
  }

  function addName(){
    const v=nameInput.value.trim();
    if(!v) return;
    names.push(v);
    nameInput.value='';
    PWY.pop();
    renderChips();
    nameInput.focus();
  }

  addBtn.addEventListener('click',addName);
  nameInput.addEventListener('keydown',(e)=>{ if(e.key==='Enter') addName(); });
  clearAllBtn.addEventListener('click',()=>{ names=[]; PWY.click(); renderChips(); });

  startSpinBtn.addEventListener('click',()=>{
    if(names.length<2) return;
    PWY.click();
    setupView.classList.remove('active');
    wheelView.classList.add('active');
    wheelAngle = 0;
    drawWheel();
    wheelCountHint.textContent=`${names.length} ตัวเลือกในวงล้อ`;
  });

  editNamesBtn.addEventListener('click',()=>{
    if(spinning) return;
    PWY.click();
    wheelView.classList.remove('active');
    setupView.classList.add('active');
  });

  spinBtn.addEventListener('click',()=>{ PWY.click(); spin(); });

  removeOptionBtn.addEventListener('click',()=>{
    PWY.click();
    if(lastWinnerIndex!==null) names.splice(lastWinnerIndex,1);
    lastWinnerIndex=null;
    resultModal.style.display='none';
    if(names.length<2){
      wheelView.classList.remove('active');
      setupView.classList.add('active');
      renderChips();
    } else {
      wheelAngle = 0;
      drawWheel();
      wheelCountHint.textContent=`${names.length} ตัวเลือกในวงล้อ`;
    }
  });

  restartBtn.addEventListener('click',()=>{
    PWY.click();
    names=[]; lastWinnerIndex=null; wheelAngle=0;
    resultModal.style.display='none';
    wheelView.classList.remove('active');
    setupView.classList.add('active');
    renderChips();
  });

  okBtn.addEventListener('click',()=>{ PWY.click(); resultModal.style.display='none'; });

  renderChips();
})();
