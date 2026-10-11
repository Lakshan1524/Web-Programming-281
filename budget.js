/* Budget planner logic */
(() => {
  const $ = id => document.getElementById(id);
  let budgets = FX.load('budgets', {});
  const month = FX.month();
  $('monthLabel').textContent = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  function spentMap() {
    const m = {};
    FX.byCategory(FX.monthTotals(month).tx).forEach(c => m[c.label] = c.value);
    return m;
  }

  function render() {
    const spent = spentMap();
    let total = 0, used = 0;
    $('budgetList').innerHTML = FX.cats.expense.map(cat => {
      const limit = Number(budgets[cat]) || 0, s = spent[cat] || 0;
      total += limit; used += s;
      const pct = limit ? Math.min(100, Math.round(s / limit * 100)) : 0;
      const cls = limit && s > limit ? 'over' : pct >= 80 ? 'warn' : '';
      let note = '';
      if (limit && s > limit) note = `<span class="neg">Over by ${FX.money(s - limit)}</span>`;
      else if (limit && pct >= 80) note = `<span style="color:#8a5a00">Almost there, ${FX.money(limit - s)} left</span>`;
      else if (limit) note = `<span class="pos">${FX.money(limit - s)} left 👍</span>`;
      else note = '<span class="muted">No limit set</span>';
      return `<div class="b-row">
        <div class="b-top"><b>${cat}</b><input type="number" min="0" data-cat="${cat}" value="${limit || ''}" placeholder="Limit ₹"></div>
        <div class="progress ${cls}"><i style="width:${pct}%"></i></div>
        <div class="row between" style="margin-top:6px;font-size:.85rem"><span class="muted">${FX.money(s)} spent</span>${note}</div>
      </div>`;
    }).join('');
    $('bTotal').textContent = FX.money(total);
    $('bSpent').textContent = FX.money(used);
    const left = total - used;
    $('bLeft').textContent = FX.money(left); $('bLeft').className = left < 0 ? 'neg' : 'pos';
  }

  $('budgetList').addEventListener('change', e => {
    const cat = e.target.dataset.cat; if (!cat) return;
    budgets[cat] = Math.max(0, Number(e.target.value) || 0);
    FX.save('budgets', budgets); FX.toast('Budget saved ✔'); render();
  });

  function rule() {
    const inc = Number($('incomeIn').value) || 0;
    if (!inc) { $('ruleOut').innerHTML = '<div class="empty">Enter your income above 👆</div>'; return; }
    const parts = [['🏠 Needs (50%)', .5, '#3b82f6', 'Rent, groceries, bills, transport'], ['🎉 Wants (30%)', .3, '#f5a524', 'Dining out, shopping, fun'], ['🏦 Savings (20%)', .2, '#0f9d73', 'Emergency fund, goals, investments']];
    $('ruleOut').innerHTML = parts.map(p => `
      <div style="margin-bottom:16px"><div class="row between"><b>${p[0]}</b><b style="color:${p[2]}">${FX.money(inc * p[1])}</b></div>
      <div class="progress"><i style="width:${p[1] * 100}%;background:${p[2]}"></i></div>
      <small class="muted">${p[3]}</small></div>`).join('') +
      `<div class="banner"><span class="em">🚀</span><span>Saving ${FX.money(inc * .2)} a month adds up to <b>${FX.money(inc * .2 * 12)}</b> in a year!</span></div>`;
  }
  $('incomeIn').addEventListener('input', rule);
  const inc = FX.monthTotals(month).income;
  if (inc) $('incomeIn').value = inc;
  rule(); render();
})();
