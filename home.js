/* Home page: snapshot, quote rotation, tip of the day */
document.addEventListener('DOMContentLoaded', () => {
  const t = FX.monthTotals(FX.month());
  document.getElementById('hBalance').textContent = FX.money(t.balance);
  document.getElementById('hBalance').className = 'big ' + (t.balance < 0 ? 'neg' : '');
  document.getElementById('hInc').textContent = FX.money(t.income);
  document.getElementById('hExp').textContent = FX.money(t.expense);
  document.getElementById('hRate').textContent = t.rate + '%';
  document.getElementById('hBar').style.width = Math.max(0, Math.min(100, t.rate)) + '%';

  let msg = 'Add your first expense to begin your journey!';
  if (t.tx.length) {
    if (t.rate >= 20) msg = 'Fantastic! You are saving ' + t.rate + '% this month. Keep it up!';
    else if (t.rate > 0) msg = 'Good start! Push your savings rate toward 20% this month.';
    else msg = 'Spending is above income. Check the Saving Tips to bring it back on track.';
  }
  document.getElementById('hMsg').textContent = msg;

  FX.rotateQuotes(document.getElementById('quote'), document.getElementById('cite'));

  const day = Math.floor(Date.now() / 86400000);
  const tip = TIPS[day % TIPS.length];
  document.getElementById('tipTitle').textContent = tip.icon + ' ' + tip.title;
  document.getElementById('tipText').textContent = tip.text;
});
