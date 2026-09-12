/* =========================================================
   Play With Yok — Sound & Speech helpers (no external assets)
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
    thVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('th')) || null;
    return thVoice;
  }
  if('speechSynthesis' in window){
    speechSynthesis.onvoiceschanged = pickVoice;
    pickVoice();
  }

  function speak(text, {rate=1, pitch=1, volume=1, interrupt=true}={}){
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
