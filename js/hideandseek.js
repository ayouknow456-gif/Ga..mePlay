(() => {
  // interval = ms ระหว่างตัวเลข | speakRate = ความเร็วพูด
  const SPEEDS = {
    normal:  { interval:1000, speakRate:0.64,  label:'ปกติ'  },
    medium:  { interval:700,  speakRate:1.0,  label:'กลาง'  },
    fast:    { interval:450,  speakRate:1.5,  label:'เร็ว'  },
    extreme: { interval:260,  speakRate:2.0,  label:'แรง'   },
  };

  let speed = 'normal';
  let timer = null;
  let count = 0;
  let total = 20;
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
    tickOnce(cfg);
    timer = setInterval(()=>tickOnce(cfg), cfg.interval);
  }

  function tickOnce(cfg){
    count++;
    counterNum.textContent = String(count);

    // วงแหวนไม่มี CSS transition — อัปเดตทันที ไม่ค้าง
    ringFg.style.strokeDashoffset = String(CIRC * (1 - count/total));

    PWY.tick();
    // ถ้าเร็วมากให้ขัด speech เดิมออกก่อน (interrupt:true เสมอ)
    PWY.speak(String(count), { rate: cfg.speakRate, interrupt: true });

    if(count >= total){
      clearInterval(timer);
      timer = null;
      finishCounting();
    }
  }

  function finishCounting(){
    countStatus.style.display = 'none';
    cancelBtn.style.display = 'none';
    document.querySelector('.ring-wrap').style.display = 'none';
    finalBanner.style.display = 'flex';
    PWY.alarmBurst();
    PWY.speak('หมดเวลา เริ่มหาได้แล้ว', { rate:1, interrupt:true });
  }

  function cancelCounting(){
    PWY.click();
    if(timer){ clearInterval(timer); timer=null; }
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
