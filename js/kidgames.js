/* =========================================================
   Play With Yok — เกมวัยเด็ก (Kid Games)
   4 mini-games:
   1. ตบมือ (Clap Pattern) — ปรบมือตามจังหวะ
   2. เป่ายิ้งฉุบ (Rock Paper Scissors)
   3. ทายตัวเลข (Guess the Number)
   4. ปิดตาชิมรส (Taste Challenge cards)
   ========================================================= */
(() => {
  // ── views ──
  const homeView = document.getElementById('homeView');

  // ════════════════════════════════
  // 1. เป่ายิ้งฉุบ  
  // ════════════════════════════════
  const rpsView   = document.getElementById('rpsView');
  const rpsBtns   = document.querySelectorAll('.rps-btn');
  const rpsResult = document.getElementById('rpsResult');
  const rpsScore  = document.getElementById('rpsScore');
  const rpsRetry  = document.getElementById('rpsRetry');
  const rpsBack   = document.getElementById('rpsBack');

  let rpsWin=0, rpsLose=0, rpsDraw=0;
  const RPS_NAMES = { rock:'✊ กำปั้น', paper:'🖐 กระดาษ', scissors:'✌️ กรรไกร' };
  const RPS_BEAT  = { rock:'scissors', scissors:'paper', paper:'rock' };

  function rpsPlay(player){
    const choices = ['rock','paper','scissors'];
    const cpu = choices[Math.floor(Math.random()*3)];
    let result;
    if(player===cpu){ result='เสมอ! 🤝'; rpsDraw++; PWY.click(); }
    else if(RPS_BEAT[player]===cpu){ result='ชนะ! 🎉'; rpsWin++; PWY.fanfare(); }
    else { result='แพ้! 😅'; rpsLose++; PWY.tick(); }

    rpsResult.innerHTML=`
      <div class="rps-showdown">
        <div class="rps-side">
          <div class="rps-big">${RPS_NAMES[player].split(' ')[0]}</div>
          <div class="rps-label">คุณ</div>
          <div class="rps-name">${RPS_NAMES[player].split(' ').slice(1).join(' ')}</div>
        </div>
        <div class="rps-vs">VS</div>
        <div class="rps-side">
          <div class="rps-big">${RPS_NAMES[cpu].split(' ')[0]}</div>
          <div class="rps-label">คอม</div>
          <div class="rps-name">${RPS_NAMES[cpu].split(' ').slice(1).join(' ')}</div>
        </div>
      </div>
      <div class="rps-verdict">${result}</div>
    `;
    rpsScore.textContent=`ชนะ ${rpsWin}  แพ้ ${rpsLose}  เสมอ ${rpsDraw}`;
    rpsRetry.style.display='inline-flex';
  }

  rpsBtns.forEach(b=>b.addEventListener('click',()=>{
    rpsResult.innerHTML='';
    rpsRetry.style.display='none';
    setTimeout(()=>rpsPlay(b.dataset.choice), 80);
  }));
  rpsRetry.addEventListener('click',()=>{ rpsResult.innerHTML=''; rpsRetry.style.display='none'; PWY.click(); });
  rpsBack.addEventListener('click',()=>nav(rpsView,homeView));

  // ════════════════════════════════
  // 2. ทายตัวเลข
  // ════════════════════════════════
  const guessView    = document.getElementById('guessView');
  const guessInput   = document.getElementById('guessInput');
  const guessSendBtn = document.getElementById('guessSendBtn');
  const guessFeedback= document.getElementById('guessFeedback');
  const guessAttempts= document.getElementById('guessAttempts');
  const guessNewBtn  = document.getElementById('guessNewBtn');
  const guessBack    = document.getElementById('guessBack');

  let secret=0, attempts=0, guessMax=10;

  function newGuessGame(){
    secret = Math.floor(Math.random()*100)+1;
    attempts = 0;
    guessFeedback.textContent='';
    guessFeedback.className='guess-feedback';
    guessAttempts.textContent='';
    guessInput.value='';
    guessInput.disabled=false;
    guessSendBtn.disabled=false;
    guessNewBtn.style.display='none';
    PWY.pop();
  }

  function doGuess(){
    const v=parseInt(guessInput.value,10);
    if(!v||v<1||v>100){ guessFeedback.textContent='กรุณาใส่ตัวเลข 1-100'; return; }
    attempts++;
    guessAttempts.textContent=`ครั้งที่ ${attempts}/${guessMax}`;
    if(v===secret){
      guessFeedback.textContent=`🎉 ถูกต้อง! คือ ${secret} (${attempts} ครั้ง)`;
      guessFeedback.className='guess-feedback win';
      guessInput.disabled=true; guessSendBtn.disabled=true;
      guessNewBtn.style.display='inline-flex';
      PWY.fanfare();
    } else if(attempts>=guessMax){
      guessFeedback.textContent=`😢 หมดโอกาสแล้ว! คำตอบคือ ${secret}`;
      guessFeedback.className='guess-feedback lose';
      guessInput.disabled=true; guessSendBtn.disabled=true;
      guessNewBtn.style.display='inline-flex';
      PWY.alarmBurst();
    } else {
      guessFeedback.textContent = v<secret ? `📈 น้อยไป! ลองเพิ่มขึ้น` : `📉 มากไป! ลองลดลง`;
      guessFeedback.className='guess-feedback hint';
      PWY.tick();
    }
    guessInput.value='';
    guessInput.focus();
  }

  guessSendBtn.addEventListener('click',doGuess);
  guessInput.addEventListener('keydown',(e)=>{ if(e.key==='Enter') doGuess(); });
  guessNewBtn.addEventListener('click',newGuessGame);
  guessBack.addEventListener('click',()=>nav(guessView,homeView));

  // ════════════════════════════════
  // 3. ปิดตาชิมรส / Taste Challenge cards
  // ════════════════════════════════
  const tasteView  = document.getElementById('tasteView');
  const tasteCard  = document.getElementById('tasteCard');
  const tasteNext  = document.getElementById('tasteNext');
  const tasteBack  = document.getElementById('tasteBack');

  const TASTE_CARDS=[
    { food:'🍋 มะนาว',       prompt:'ปิดตาแล้วชิมดู — เปรี้ยวแค่ไหน?',          hint:'เปรี้ยว 🍋' },
    { food:'🍫 ช็อกโกแลต',   prompt:'ชิมแล้วบอกว่า หวาน ขม หรือ ทั้งคู่?',     hint:'หวานขม 🍫' },
    { food:'🧂 เกลือ',       prompt:'ชิมหน่อยเดียว — เค็มมากน้อยแค่ไหน?',        hint:'เค็ม 🧂' },
    { food:'🍯 น้ำผึ้ง',     prompt:'ปิดตาชิม — หวานระดับไหน 1-10?',             hint:'หวาน 🍯' },
    { food:'🌶️ พริก',        prompt:'ชิมแล้วบอก — เผ็ดทนได้หรือเปล่า?',          hint:'เผ็ด 🌶️' },
    { food:'🍌 กล้วย',       prompt:'ปิดตา ชิม แล้วทายว่าผลไม้อะไร?',            hint:'กล้วย 🍌' },
    { food:'🥒 แตงกวา',      prompt:'กัดแล้วบอก กรอบหรือเปล่า?',                 hint:'สดกรอบ 🥒' },
    { food:'🍊 ส้ม',         prompt:'ปิดตาชิม — เปรี้ยวหรือหวานกว่า?',           hint:'ส้ม 🍊' },
    { food:'🧅 หัวหอม',      prompt:'ดมแล้วทาย — กลิ่นนี้คืออะไร?',              hint:'หัวหอม 🧅' },
    { food:'🍵 ชาเขียว',     prompt:'ดื่มแล้วบอก — ฝาดแค่ไหน?',                  hint:'ฝาดอ่อน 🍵' },
    { food:'🧁 คัพเค้ก',     prompt:'กัดคำเดียว — อธิบายรสชาติด้วยคำ 3 คำ',      hint:'หวาน นุ่ม มัน 🧁' },
    { food:'🫐 บลูเบอรี่',   prompt:'ชิมแล้วบอก — เปรี้ยวหรือหวานกว่า?',         hint:'หวานอมเปรี้ยว 🫐' },
  ];
  let tasteIdx = 0;
  let tasteShuffled = [];

  function shuffleTaste(){
    tasteShuffled = [...TASTE_CARDS].sort(()=>Math.random()-0.5);
    tasteIdx=0;
  }

  function showTasteCard(){
    const c=tasteShuffled[tasteIdx % tasteShuffled.length];
    tasteCard.innerHTML=`
      <div class="taste-food">${c.food}</div>
      <div class="taste-prompt">${c.prompt}</div>
      <div class="taste-hint">เฉลย: ${c.hint}</div>
    `;
    PWY.pop();
  }

  tasteNext.addEventListener('click',()=>{ tasteIdx++; showTasteCard(); PWY.click(); });
  tasteBack.addEventListener('click',()=>nav(tasteView,homeView));

  // ════════════════════════════════
  // 4. ตบมือตามจังหวะ / Clap Pattern
  // ════════════════════════════════
  const clapView    = document.getElementById('clapView');
  const clapDisplay = document.getElementById('clapDisplay');
  const clapLevel   = document.getElementById('clapLevel');
  const clapNewBtn  = document.getElementById('clapNewBtn');
  const clapBack    = document.getElementById('clapBack');

  const CLAP_LEVELS=[
    { label:'ง่าย',   size:3 },
    { label:'กลาง',   size:5 },
    { label:'ยาก',    size:7 },
    { label:'เทพ',    size:10},
  ];
  let clapLvlIdx=0;

  function genPattern(size){
    const beats=[];
    for(let i=0;i<size;i++) beats.push(Math.random()<0.6?'👏':'—');
    return beats;
  }

  function showClapPattern(){
    const cfg=CLAP_LEVELS[clapLvlIdx];
    const pat=genPattern(cfg.size);
    clapLevel.textContent=`ระดับ: ${cfg.label} (${cfg.size} จังหวะ)`;
    clapDisplay.innerHTML = pat.map(b=>`<span class="beat ${b==='👏'?'clap':'rest'}">${b}</span>`).join('');
    PWY.pop();
    // เล่นเสียง preview
    pat.forEach((b,i)=>{
      if(b==='👏') setTimeout(()=>PWY.tick(), i*350);
    });
  }

  clapNewBtn.addEventListener('click',()=>{ clapLvlIdx=(clapLvlIdx+1)%CLAP_LEVELS.length; showClapPattern(); });
  clapBack.addEventListener('click',()=>nav(clapView,homeView));

  // ════════════════════════════════
  // Navigation helpers
  // ════════════════════════════════
  function nav(from,to){
    from.classList.remove('active');
    to.classList.add('active');
    PWY.click();
  }

  document.getElementById('goRps').addEventListener('click',()=>{ nav(homeView,rpsView); rpsResult.innerHTML=''; rpsRetry.style.display='none'; });
  document.getElementById('goGuess').addEventListener('click',()=>{ nav(homeView,guessView); newGuessGame(); });
  document.getElementById('goTaste').addEventListener('click',()=>{ nav(homeView,tasteView); shuffleTaste(); showTasteCard(); });
  document.getElementById('goClap').addEventListener('click',()=>{ nav(homeView,clapView); clapLvlIdx=0; showClapPattern(); });
})();
