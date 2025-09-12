(() => {
  // --- ÉTAT DE LA BOÎTE ---
  const state = {
    t: 0,                 // secondes simulées
    growth: 0,            // 0..100 %
    ph: 6.0,              // pH
    ec: 1.4,              // mS/cm
    temp: 22.0,           // °C air
    rh: 60,               // % humidité relative
    lightOn: true,
    pumpOn: false,
    fanOn: true,
    cycle: { pumpOn: 15, pumpOff: 300, timer: 0 },
    speed: 1,             // multiplicateur temps
    running: false,
    noise: () => (Math.random() - 0.5) * 0.05
  };

  // Hypothèses simples pour les “ajouts”
  const effects = {
    phPlus:  () => { state.ph += 0.25; logLine('Dose pH+ appliquée (+0.25)'); },
    phMinus: () => { state.ph -= 0.25; logLine('Dose pH- appliquée (−0.25)'); },
    addWater: () => {
      // l’eau dilue l’EC et rapproche le pH vers 7.0
      state.ec = Math.max(0.3, state.ec * 0.85);
      state.ph += (7.0 - state.ph) * 0.20;
      logLine('Ajout eau: EC ×0.85, pH → vers 7.0');
    }
  };

  // --- UI ---
  const ulS = document.getElementById('sensors');
  const ulA = document.getElementById('actuators');
  const log = document.getElementById('log');
  const cvs = document.getElementById('growth');
  const ctx = cvs.getContext('2d');
  const btnStart = document.getElementById('start');
  const btnPause = document.getElementById('pause');
  const btnReset = document.getElementById('reset');
  const speedSel = document.getElementById('speed');

  // Nouveaux boutons
  const btnPhPlus = document.getElementById('btn-ph-plus');
  const btnPhMinus = document.getElementById('btn-ph-minus');
  const btnAddWater = document.getElementById('btn-add-water');

  const fmt = (n, d=1) => Number(n).toFixed(d);

  function logLine(s){ const el=document.createElement('div'); el.textContent=s; log.prepend(el); }

  function drawChart() {
    const { width:w, height:h } = cvs;
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle = '#eef';
    ctx.fillRect(0,0,w,h);
    // axes
    ctx.strokeStyle = '#889';
    ctx.beginPath(); ctx.moveTo(40,10); ctx.lineTo(40,h-30); ctx.lineTo(w-10,h-30); ctx.stroke();

    // courbe simple (niveau de croissance courant)
    ctx.strokeStyle = '#06c';
    ctx.beginPath();
    for (let x=0; x<=100; x++) {
      const y = h-30 - (state.growth * (h-50))/100;
      ctx.lineTo(40 + x*5, y);
    }
    ctx.stroke();

    ctx.fillStyle='#111';
    ctx.fillText(`Croissance: ${fmt(state.growth,1)} %`, 50, 20);
  }

  function renderPanels() {
    ulS.innerHTML = `
      <li>pH: <b>${fmt(state.ph,2)}</b> (cible 5.8–6.2)</li>
      <li>EC: <b>${fmt(state.ec,2)} mS/cm</b> (cible 1.2–1.8)</li>
      <li>T° air: <b>${fmt(state.temp,1)} °C</b></li>
      <li>Humidité: <b>${fmt(state.rh,0)} %</b></li>
      <li>Lumière: <b>${state.lightOn?'ON':'OFF'}</b></li>
    `;
    ulA.innerHTML = `
      <li>Pompe nutriments: <b>${state.pumpOn?'ON':'OFF'}</b></li>
      <li>Ventilateur: <b>${state.fanOn?'ON':'OFF'}</b></li>
    `;
    drawChart();
  }

  function step(dt) {
    // cycles pompe ON/OFF
    state.cycle.timer += dt;
    if (state.pumpOn && state.cycle.timer >= state.cycle.pumpOn) {
      state.pumpOn = false; state.cycle.timer = 0; logLine('Pompe → OFF');
    } else if (!state.pumpOn && state.cycle.timer >= state.cycle.pumpOff) {
      state.pumpOn = true; state.cycle.timer = 0; logLine('Pompe → ON');
    }

    // dynamique simple des capteurs
    state.ph += state.noise();
    if (state.pumpOn) state.ph += (6.0 - state.ph) * 0.05;

    state.ec += (state.pumpOn ? +0.01 : -0.005);
    state.ec = Math.max(0.3, Math.min(2.5, state.ec));

    state.temp += (Math.random()-0.5)*0.1*state.speed;
    state.rh += (Math.random()-0.5)*0.4*state.speed;
    state.temp = Math.max(16, Math.min(28, state.temp));
    state.rh = Math.max(35, Math.min(85, state.rh));

    // croissance dépend d’un score environnemental
    const scorePH = 1 - Math.min(Math.abs(state.ph-6.0)/0.8, 1);
    const scoreEC = 1 - Math.min(Math.abs(state.ec-1.5)/0.6, 1);
    const scoreT  = 1 - Math.min(Math.abs(state.temp-22)/6, 1);
    const env = Math.max(0, (scorePH + scoreEC + scoreT) / 3);
    const growthRate = env * 0.08;   // %/s à 1×
    state.growth = Math.min(100, state.growth + growthRate * dt);

    state.t += dt;
  }

  let lastTS = 0;
  function loop(ts){
    if(!state.running){ lastTS = ts; return requestAnimationFrame(loop); }
    const realDt = (ts - lastTS) / 1000; lastTS = ts;
    const dt = realDt * state.speed;
    step(dt);
    renderPanels();
    requestAnimationFrame(loop);
  }

  // --- Contrôles ---
  btnStart.onclick = ()=>{ if(!state.running){ state.running = true; logLine('Simulation démarrée'); } };
  btnPause.onclick = ()=>{ state.running = false; logLine('Pause'); };
  btnReset.onclick = ()=>{
    Object.assign(state, { t:0,growth:0,ph:6.0,ec:1.4,temp:22,rh:60,lightOn:true,pumpOn:false,fanOn:true,cycle:{pumpOn:15,pumpOff:300,timer:0},speed:state.speed,running:false });
    logLine('Réinitialisation'); renderPanels();
  };
  speedSel.onchange = ()=>{ state.speed = Number(speedSel.value||1); logLine(`Vitesse ${state.speed}×`); };

  // Nouveaux boutons d’action
  btnPhPlus.onclick  = ()=>{ effects.phPlus();  renderPanels(); };
  btnPhMinus.onclick = ()=>{ effects.phMinus(); renderPanels(); };
  btnAddWater.onclick= ()=>{ effects.addWater(); renderPanels(); };

  renderPanels();
  requestAnimationFrame(loop);
})();
