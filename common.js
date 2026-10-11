/* FitXpence – shared helpers, navbar, footer, storage, charts */
const FX = {
  cur: '₹',
  cats: {
    expense: ['Food & Dining', 'Transport', 'Shopping', 'Bills & Utilities', 'Rent', 'Health & Fitness', 'Entertainment', 'Education', 'Travel', 'Other'],
    income: ['Salary', 'Freelance', 'Business', 'Gift', 'Investment', 'Other']
  },
  colors: ['#0f9d73', '#f5a524', '#3b82f6', '#e5484d', '#8b5cf6', '#14b8a6', '#ec4899', '#84cc16', '#f97316', '#64748b'],
  quotes: [
    ['A budget is telling your money where to go instead of wondering where it went.', 'Dave Ramsey'],
    ['Do not save what is left after spending; spend what is left after saving.', 'Warren Buffett'],
    ['Small amounts saved daily add up to huge investments.', 'Anonymous'],
    ['The best time to start saving was yesterday. The next best time is today.', 'FitXpence'],
    ['Financial fitness is not a sprint; it is a habit built one rupee at a time.', 'FitXpence'],
    ['Beware of little expenses; a small leak will sink a great ship.', 'Benjamin Franklin'],
    ['Every rupee you save is a vote for your future freedom.', 'FitXpence']
  ]
};

FX.load = (k, d) => { try { const v = JSON.parse(localStorage.getItem('fx_' + k)); return v === null || v === undefined ? d : v; } catch (e) { return d; } };
FX.save = (k, v) => { try { localStorage.setItem('fx_' + k, JSON.stringify(v)); } catch (e) { } };
FX.money = n => (n < 0 ? '-' : '') + FX.cur + Math.abs(Number(n) || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
FX.today = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
FX.month = () => FX.today().slice(0, 7);
FX.esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
FX.uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
FX.monthTotals = (month) => {
  const tx = FX.load('tx', []).filter(t => t.date.startsWith(month));
  const income = tx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = tx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  return { tx, income, expense, balance: income - expense, rate: income > 0 ? Math.round((income - expense) / income * 100) : 0 };
};
FX.byCategory = (list) => {
  const m = {};
  list.filter(t => t.type === 'expense').forEach(t => m[t.category] = (m[t.category] || 0) + t.amount);
  return Object.entries(m).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
};

FX.toast = (msg) => {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('show');
  clearTimeout(FX._tt); FX._tt = setTimeout(() => t.classList.remove('show'), 3200);
};

/* Donut chart drawn on a canvas (no external libraries) */
FX.donut = (canvas, data, centerLabel) => {
  const size = 240, dpr = window.devicePixelRatio || 1;
  canvas.width = size * dpr; canvas.height = size * dpr;
  canvas.style.width = size + 'px'; canvas.style.height = size + 'px';
  const c = canvas.getContext('2d'); c.scale(dpr, dpr); c.clearRect(0, 0, size, size);
  const total = data.reduce((s, d) => s + d.value, 0), cx = size / 2, r = 100, lw = 34;
  c.lineWidth = lw; c.lineCap = 'butt';
  if (!total) { c.strokeStyle = '#e9f1ed'; c.beginPath(); c.arc(cx, cx, r, 0, Math.PI * 2); c.stroke(); }
  else {
    let a = -Math.PI / 2;
    data.forEach((d, i) => {
      const ang = d.value / total * Math.PI * 2;
      c.strokeStyle = FX.colors[i % FX.colors.length];
      c.beginPath(); c.arc(cx, cx, r, a, a + ang - (data.length > 1 ? 0.02 : 0)); c.stroke();
      a += ang;
    });
  }
  c.fillStyle = '#7b8c85'; c.font = '600 12px Inter, sans-serif'; c.textAlign = 'center';
  c.fillText(centerLabel || 'Total spent', cx, cx - 10);
  c.fillStyle = '#0f1f1a'; c.font = '800 24px Inter, sans-serif';
  c.fillText(FX.money(total), cx, cx + 16);
};

FX.renderHeader = () => {
  const page = location.pathname.split('/').pop() || 'index.html';
  const links = [['index.html', 'Home'], ['tracker.html', 'Tracker'], ['budget.html', 'Budget'], ['goals.html', 'Goals'], ['tips.html', 'Saving Tips'], ['about.html', 'About']];
  const el = document.getElementById('site-header');
  if (!el) return;
  el.innerHTML = `
  <nav class="navbar"><div class="container nav-inner">
    <a href="index.html" class="logo"><div class="logo-mark">💪</div><span>Fit<span>Xpence</span></span></a>
    <button class="burger" aria-label="Menu" id="burger">☰</button>
    <ul class="nav-links" id="navLinks">
      ${links.map(([h, t]) => `<li><a href="${h}" class="${page === h ? 'active' : ''}">${t}</a></li>`).join('')}
      <li><a href="tracker.html" class="cta">+ Add Expense</a></li>
    </ul></div></nav>`;
  document.getElementById('burger').onclick = () => document.getElementById('navLinks').classList.toggle('open');
};

FX.renderFooter = () => {
  const el = document.getElementById('site-footer');
  if (!el) return;
  el.innerHTML = `
  <footer><div class="container">
    <div class="foot-grid">
      <div><a href="index.html" class="logo"><div class="logo-mark">💪</div><span>FitXpence</span></a>
        <p>Get financially fit. Track every expense, plan smarter budgets and grow your savings, one small win at a time.</p></div>
      <div><h4>Explore</h4><a href="tracker.html">Expense Tracker</a><a href="budget.html">Budget Planner</a><a href="goals.html">Savings Goals</a></div>
      <div><h4>Learn</h4><a href="tips.html">Saving Tips</a><a href="tips.html#challenges">Money Challenges</a><a href="about.html">About &amp; FAQ</a></div>
    </div>
    <div class="foot-bottom">© ${new Date().getFullYear()} FitXpence. Your data stays on your device (browser storage).</div>
  </div></footer>`;
};

FX.rotateQuotes = (bq, cite) => {
  if (!bq) return;
  let i = Math.floor(Math.random() * FX.quotes.length);
  const show = () => { bq.style.opacity = 0; setTimeout(() => { bq.textContent = '“' + FX.quotes[i][0] + '”'; cite.textContent = '— ' + FX.quotes[i][1]; bq.style.opacity = 1; i = (i + 1) % FX.quotes.length; }, 350); };
  show(); setInterval(show, 7000);
};

document.addEventListener('DOMContentLoaded', () => { FX.renderHeader(); FX.renderFooter(); });
