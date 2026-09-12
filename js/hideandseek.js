/* =========================================================
   Play With Yok — Sound & Speech helpers (Updated for Male Voice)
   ========================================================= */

const PWY = (() => {
  let ctx = null;
  function actx(){
    if(!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if(ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // generic short tone
  function tone({freq=440, duration=0.12, type='sine', gain=0.18, glideTo=null, delay=0}={}){
    const c = actx();
    const t0 = c.currentTime + delay;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if(glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t0 + duration);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
    osc.connect(g).connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  }

  function click(){ tone({freq:520, duration:0.06, type:'triangle', gain:0.12}); }
  function tick(){ tone({freq:900, duration:0.045, type:'square', gain:0.10}); }
  function pop(){ tone({freq:300, duration:0.09, type:'sine', gain:0.16, glideTo:520}); }
  function whoosh(){ tone({freq:180, duration:0.35, type:'sawtooth', gain:0.08, glideTo:40}); }
  function fanfare(){
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f,i)=> tone({freq:f, duration:0.28, type:'triangle', gain:0.15, delay:i*0.09}));
  }
  function alarmBurst(){
    [0,0.14,0.28].forEach(d=> tone({freq:220, duration:0.14, type:'square', gain:0.14, delay:d}));
  }

  // ---------------- speech ----------------
  let thVoice = null;
  function pickVoice(){
    const voices = window.speechSynthesis ? speechSynthesis.getVoices() : [];
    const thVoices = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith('th'));
    
    // พยายามหาเสียงผู้ชายก่อน
    thVoice = thVoices.find(v => 
      v.name.toLowerCase().includes('male') || 
      v.name.toLowerCase().includes('niwat') || 
      v.name.toLowerCase().includes('prachya')
    ) || thVoices[0] || null;
    
    return thVoice;
  }
  if('speechSynthesis' in window){
    speechSynthesis.onvoiceschanged = pickVoice;
    pickVoice();
  }

  function speak(text, {rate=1, pitch=0.75, volume=1, interrupt=true}={}){
    if(!('speechSynthesis' in window)) return;
    if(interrupt) speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'th-TH';
    if(thVoice) u.voice = thVoice;
    u.rate = rate; u.pitch = pitch; u.volume = volume;
    speechSynthesis.speak(u);
  }

  function stopSpeak(){ if('speechSynthesis' in window) speechSynthesis.cancel(); }

  return { click, tick, pop, whoosh, fanfare, alarmBurst, speak, stopSpeak };
})();

/* =========================================================
   Counter App Logic (Event-Driven Counting)
   ========================================================= */
(() => {
  // interval = ms ระหว่างตัวเลข (เวลาขั้นต่ำ) | speakRate = ความเร็วพูด
  const SPEEDS = {
    normal:  { interval:900, speakRate:0.50,  label:'ปกติ'  },
    medium:  { interval:700,  speakRate:1.0,  label:'กลาง'  },
    fast:    { interval:450,  speakRate:1.5,  label:'เร็ว'  },
    extreme: { interval:260,  speakRate:2.0,  label:'แรง'   },
  };

  let speed = 'normal';
  let timer = null;
  let count = 0;
  let total = 50;
  const CIRC = 2 * Math.PI * 90;

  const setupView  = document.getElementById('setupView');
  const countView  = document.getElementById('countView');
  const secInput   = document.getElementById('secInput');
  const speedGroup = document.getElementById('speedGroup');
  const startBtn   = document.getElementById('startBtn');
  const counterNum = document.getElementById('counterNum');
  const ringFg     = document.getElementById('ringFg');
  const countStatus= document.getElementById('countStatus');
  const cancelBtn  = document.getElementById('cancelBtn');
  const finalBanner= document.getElementById('finalBanner');
  const recountBtn = document.getElementById('recountBtn');

  ringFg.style.strokeDasharray  = CIRC;
  ringFg.style.strokeDashoffset = CIRC;

  speedGroup.addEventListener('click',(e)=>{
    const btn = e.target.closest('.pill');
    if(!btn) return;
    PWY.click();
    [...speedGroup.children].forEach(p=>p.classList.remove('active'));
    btn.classList.add('active');
    speed = btn.dataset.speed;
  });

  function resetCountUI(){
    count = 0;
    counterNum.textContent = '0';
    ringFg.style.strokeDashoffset = CIRC;
    countStatus.textContent = 'กำลังนับ...';
    countStatus.style.display = 'block';
    cancelBtn.style.display = 'inline-flex';
    finalBanner.style.display = 'none';
    document.querySelector('.ring-wrap').style.display = 'flex';
  }

  function startCounting(){
    total = Math.max(3, Math.min(120, parseInt(secInput.value,10)||20));
    PWY.click();
    setupView.classList.remove('active');
    countView.classList.add('active');
    resetCountUI();

    const cfg = SPEEDS[speed];
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    
    // เริ่มนับเลขตัวแรก
    nextTick(cfg);
  }

  function nextTick(cfg){
    count++;
    
    // ถ้านับครบแล้วให้จบการทำงาน
    if(count > total){
      finishCounting();
      return;
    }

    // อัปเดต UI
    counterNum.textContent = String(count);
    ringFg.style.strokeDashoffset = String(CIRC * (1 - count/total));
    PWY.tick();

    const startTime = Date.now();

    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(String(count));
      u.lang = 'th-TH';
      u.rate = cfg.speakRate;
      u.pitch = 0.75; // ตั้งให้เป็นเสียงทุ้มผู้ชาย

      let nextCalled = false;
      const goNext = () => {
        if(nextCalled) return;
        nextCalled = true;
        
        // คำนวณเวลาที่ใช้พูดไป ถ้าพูดไวกว่า interval ให้รอจนครบจังหวะ 
        // แต่ถ้าคำยาวใช้เวลาพูดนานกว่า interval ก็ให้ไปต่อทันที
        const elapsed = Date.now() - startTime;
        const waitTime = Math.max(10, cfg.interval - elapsed);
        
        timer = setTimeout(() => nextTick(cfg), waitTime);
      };

      u.onend = goNext;
      u.onerror = goNext;
      
      // Fallback เผื่อเบราว์เซอร์ไม่ยอมส่งสัญญาณ onend (บังคับไปต่อใน 2.5 วิ)
      timer = setTimeout(goNext, Math.max(cfg.interval, 2500));

      speechSynthesis.speak(u);
    } else {
      // กรณีเบราว์เซอร์ไม่รองรับเสียงพูด
      timer = setTimeout(() => nextTick(cfg), cfg.interval);
    }
  }

  function finishCounting(){
    countStatus.style.display = 'none';
    cancelBtn.style.display = 'none';
    document.querySelector('.ring-wrap').style.display = 'none';
    finalBanner.style.display = 'flex';
    PWY.alarmBurst();
    PWY.speak('หมดเวลา เริ่มหาได้แล้ว', { rate:1, pitch:0.75, interrupt:true });
  }

  function cancelCounting(){
    PWY.click();
    if(timer){ clearTimeout(timer); timer=null; }
    PWY.stopSpeak();
    countView.classList.remove('active');
    setupView.classList.add('active');
  }

  startBtn.addEventListener('click', startCounting);
  cancelBtn.addEventListener('click', cancelCounting);
  recountBtn.addEventListener('click',()=>{
    PWY.click();
    countView.classList.remove('active');
    setupView.classList.add('active');
  });
})();
