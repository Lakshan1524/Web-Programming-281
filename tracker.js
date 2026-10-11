/* Expense tracker logic */
(() => {
  let tx = FX.load('tx', []);
  let type = 'expense';
  const $ = id => document.getElementById(id);

  $('date').value = FX.today();
  $('fMonth').value = FX.month();

  function fillCategories() {
    $('category').innerHTML = FX.cats[type].map(c => `<option>${c}</option>`).join('');
  }
  function setType(t) {
    type = t;
    $('tExp').className = t === 'expense' ? 'on exp' : '';
    $('tInc').className = t === 'income' ? 'on inc' : '';
    fillCategories();
  }
  $('tExp').onclick = () => setType('expense');
  $('tInc').onclick = () => setType('income');
  fillCategories();

  $('txForm').addEventListener('submit', e => {
    e.preventDefault();
    const amount = parseFloat($('amount').value);
    if (!(amount > 0)) return FX.toast('Please enter a valid amount');
    tx.push({ id: FX.uid(), type, amount, category: $('category').value, date: $('date').value, note: $('note').value.trim() });
    FX.save('tx', tx);
    $('amount').value = ''; $('note').value = '';
    $('fMonth').value = $('date').value.slice(0, 7);
    FX.toast(type === 'income' ? '🎉 Income added. Great work!' : '✅ Expense recorded. Every entry counts!');
    render();
  });

  function filtered() {
    const m = $('fMonth').value, ty = $('fType').value, q = $('fSearch').value.toLowerCase();
    return tx.filter(t => (!m || t.date.startsWith(m)) && (ty === 'all' || t.type === ty) &&
      (!q || t.category.toLowerCase().includes(q) || t.note.toLowerCase().includes(q)))
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  function coach(t) {
    const box = $('coach'); box.className = 'banner mt';
    let icon = '✨', msg;
    if (!t.tx.length) msg = 'No transactions for this month yet. Add your first one to get personalised coaching!';
    else if (t.income === 0) msg = 'Add your income to see your savings rate and get tailored feedback.';
    else if (t.rate >= 30) { icon = '🏆'; msg = `Outstanding! You are saving ${t.rate}% of your income. You are a money-fitness champion!`; }
    else if (t.rate >= 20) { icon = '🎉'; msg = `Great job! A ${t.rate}% savings rate hits the healthy 20% target. Keep this momentum going!`; }
    else if (t.rate > 0) { icon = '💪'; msg = `You are saving ${t.rate}%. Trim one small expense this week to reach 20%. You can do it!`; box.classList.add('warn'); }
    else { icon = '⚠️'; msg = 'Spending is above income this month. Review your top category and check the Saving Tips page.'; box.classList.add('bad'); }
    box.querySelector('.em').textContent = icon; $('coachMsg').textContent = msg;
  }

  function render() {
    const m = $('fMonth').value || FX.month();
    const t = FX.monthTotals(m);
    $('sInc').textContent = FX.money(t.income);
    $('sExp').textContent = FX.money(t.expense);
    $('sBal').textContent = FX.money(t.balance); $('sBal').className = t.balance < 0 ? 'neg' : '';
    $('sRate').textContent = t.rate + '%';
    coach(t);

    const cats = FX.byCategory(t.tx);
    FX.donut($('chart'), cats);
    const total = cats.reduce((s, c) => s + c.value, 0);
    $('legend').innerHTML = cats.length ? cats.map((c, i) =>
      `<li><i style="background:${FX.colors[i % FX.colors.length]}"></i>${FX.esc(c.label)}<b>${Math.round(c.value / total * 100)}%</b></li>`).join('')
      : '<li class="muted">No expenses to chart yet</li>';

    const list = filtered();
    $('txBody').innerHTML = list.length ? list.map(x => `
      <tr><td>${x.date}</td><td><span class="tag">${FX.esc(x.category)}</span></td><td>${FX.esc(x.note) || '<span class="muted">–</span>'}</td>
      <td style="text-align:right" class="${x.type === 'income' ? 'amt-in' : 'amt-out'}">${x.type === 'income' ? '+' : '-'}${FX.money(x.amount)}</td>
      <td><button class="icon-btn" data-id="${x.id}" title="Delete">🗑️</button></td></tr>`).join('')
      : '<tr><td colspan="5"><div class="empty"><span class="em">🪙</span>No transactions found. Add one to get started!</div></td></tr>';
  }

  $('txBody').addEventListener('click', e => {
    const b = e.target.closest('[data-id]'); if (!b) return;
    tx = tx.filter(t => t.id !== b.dataset.id); FX.save('tx', tx); FX.toast('Transaction deleted'); render();
  });
  ['fMonth', 'fType', 'fSearch'].forEach(id => $(id).addEventListener('input', render));

  $('exportBtn').onclick = () => {
    const rows = [['Date', 'Type', 'Category', 'Note', 'Amount']].concat(filtered().map(t => [t.date, t.type, t.category, '"' + t.note.replace(/"/g, '""') + '"', t.amount]));
    const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'fitxpence-transactions.csv'; a.click();
    FX.toast('CSV exported');
  };

  $('sampleBtn').onclick = () => {
    const m = FX.month();
    const d = n => `${m}-${String(n).padStart(2, '0')}`;
    const sample = [
      ['income', 50000, 'Salary', 1, 'Monthly salary'], ['income', 6000, 'Freelance', 8, 'Design project'],
      ['expense', 14000, 'Rent', 2, 'House rent'], ['expense', 3200, 'Bills & Utilities', 4, 'Electricity & internet'],
      ['expense', 4500, 'Food & Dining', 5, 'Groceries'], ['expense', 1800, 'Food & Dining', 10, 'Dining out'],
      ['expense', 2200, 'Transport', 6, 'Fuel & metro'], ['expense', 2500, 'Shopping', 12, 'Clothes'],
      ['expense', 1200, 'Entertainment', 14, 'Movies & OTT'], ['expense', 1500, 'Health & Fitness', 9, 'Gym']
    ].filter(s => s[3] <= new Date().getDate() || true)
     .map(s => ({ id: FX.uid(), type: s[0], amount: s[1], category: s[2], date: d(s[3]), note: s[4] }));
    tx = tx.concat(sample); FX.save('tx', tx); $('fMonth').value = m;
    FX.toast('Sample data loaded'); render();
  };

  $('clearBtn').onclick = () => {
    if (!tx.length) return FX.toast('Nothing to clear');
    if (confirm('Delete ALL transactions? This cannot be undone.')) { tx = []; FX.save('tx', tx); FX.toast('All data cleared'); render(); }
  };

  render();
})();
