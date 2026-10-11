/* Tips page: filters, challenges, calculator */
(() => {
  const $ = id => document.getElementById(id);

  /* Tips + filter chips */
  const cats = ['All', ...new Set(TIPS.map(t => t.cat))];
  let active = 'All';
  function renderTips() {
    $('chips').innerHTML = cats.map(c => `<button class="chip ${c === active ? 'on' : ''}" data-c="${c}">${c}</button>`).join('');
    $('tipGrid').innerHTML = TIPS.filter(t => active === 'All' || t.cat === active).map(t => `
      <div class="card hover"><div class="icon-box">${t.icon}</div><span class="badge">${t.cat}</span>
      <h3 style="margin-top:10px">${t.title}</h3><p>${t.text}</p><div class="tip-save">💚 ${t.save}</div></div>`).join('');
  }
  $('chips').addEventListener('click', e => { const b = e.target.closest('[data-c]'); if (b) { active = b.dataset.c; renderTips(); } });
  renderTips();

  /* 30-day no-spend */
  let ns = FX.load('nospend', []);
  function renderNS() {
    $('nsGrid').innerHTML = Array.from({ length: 30 }, (_, i) => i + 1).map(d =>
      `<button class="day ${ns.includes(d) ? 'done' : ''}" data-d="${d}">${ns.includes(d) ? '✓' : d}<small>Day ${d}</small></button>`).join('');
    $('nsCount').textContent = ns.length + ' / 30 days';
    $('nsBar').style.width = (ns.length / 30 * 100) + '%';
    $('nsMsg').textContent = ns.length === 30 ? '🏆 Challenge complete! You are a saving superstar!'
      : ns.length >= 15 ? '🔥 Over halfway! Your discipline is paying off.'
      : ns.length > 0 ? '👏 Great going. Every no-spend day is money kept.' : 'Tap a day when you finish it without non-essential spending.';
  }
  $('nsGrid').addEventListener('click', e => {
    const b = e.target.closest('[data-d]'); if (!b) return;
    const d = Number(b.dataset.d); ns = ns.includes(d) ? ns.filter(x => x !== d) : [...ns, d];
    FX.save('nospend', ns); renderNS();
  });
  $('nsReset').onclick = () => { if (confirm('Reset the 30-day challenge?')) { ns = []; FX.save('nospend', ns); renderNS(); } };
  renderNS();

  /* 52-week challenge */
  const UNIT = 50;
  let wk = FX.load('weeks', []);
  $('wTotalAll').textContent = FX.money(UNIT * 52 * 53 / 2);
  function renderWK() {
    $('wGrid').innerHTML = Array.from({ length: 52 }, (_, i) => i + 1).map(w =>
      `<button class="day ${wk.includes(w) ? 'done' : ''}" data-w="${w}">${w}<small>${FX.money(w * UNIT)}</small></button>`).join('');
    const saved = wk.reduce((s, w) => s + w * UNIT, 0);
    $('wCount').textContent = `${FX.money(saved)} saved · ${wk.length}/52 weeks`;
    $('wBar').style.width = (wk.length / 52 * 100) + '%';
  }
  $('wGrid').addEventListener('click', e => {
    const b = e.target.closest('[data-w]'); if (!b) return;
    const w = Number(b.dataset.w); wk = wk.includes(w) ? wk.filter(x => x !== w) : [...wk, w];
    FX.save('weeks', wk); renderWK();
    if (wk.length === 52) FX.toast('🏆 You completed the 52-week challenge!');
  });
  $('wReset').onclick = () => { if (confirm('Reset the 52-week challenge?')) { wk = []; FX.save('weeks', wk); renderWK(); } };
  renderWK();

  /* Compound calculator */
  function calc() {
    const m = Number($('cMonthly').value) || 0, r = (Number($('cRate').value) || 0) / 100 / 12, y = Number($('cYears').value), n = y * 12;
    $('cYearsVal').textContent = y;
    const total = r ? m * ((Math.pow(1 + r, n) - 1) / r) : m * n, put = m * n;
    $('cTotal').textContent = FX.money(total); $('cPut').textContent = FX.money(put); $('cGain').textContent = FX.money(total - put);
  }
  ['cMonthly', 'cRate', 'cYears'].forEach(id => $(id).addEventListener('input', calc));
  calc();
})();
