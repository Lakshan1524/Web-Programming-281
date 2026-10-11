/* Savings goals logic */
(() => {
  const $ = id => document.getElementById(id);
  let goals = FX.load('goals', []);

  $('goalForm').addEventListener('submit', e => {
    e.preventDefault();
    const target = Number($('gTarget').value), saved = Number($('gSaved').value) || 0;
    if (!(target > 0)) return FX.toast('Enter a valid target');
    goals.push({ id: FX.uid(), name: $('gName').value.trim(), target, saved: Math.min(saved, target), date: $('gDate').value });
    FX.save('goals', goals); e.target.reset(); FX.toast('🎯 Goal created. You have got this!'); render();
  });

  function milestone(p) {
    if (p >= 100) return ['🎉 Goal achieved!', 'done'];
    if (p >= 75) return ['🔥 Almost there!', ''];
    if (p >= 50) return ['💪 Halfway done', ''];
    if (p >= 25) return ['🌱 Great start', ''];
    return ['🚀 Just beginning', ''];
  }

  function render() {
    const total = goals.reduce((s, g) => s + g.saved, 0);
    $('gTotal').textContent = FX.money(total);
    const done = goals.filter(g => g.saved >= g.target).length;
    $('gMsg').textContent = goals.length
      ? (done ? `Amazing! You have completed ${done} goal${done > 1 ? 's' : ''}. Time to dream bigger!` : 'Every deposit moves you closer. Keep going!')
      : 'Create your first goal to start saving with purpose.';

    $('goalList').innerHTML = goals.length ? goals.map(g => {
      const p = Math.min(100, Math.round(g.saved / g.target * 100)), m = milestone(p);
      let need = '';
      if (g.date && p < 100) {
        const days = Math.ceil((new Date(g.date) - new Date(FX.today())) / 86400000);
        if (days > 0) need = `Save <b>${FX.money((g.target - g.saved) / Math.max(1, days / 30))}</b>/month to finish on time`;
        else need = '<span class="neg">Target date passed</span>';
      }
      return `<div class="card goal-card">
        <h3><span>${FX.esc(g.name)}</span><button class="icon-btn" data-del="${g.id}" title="Delete">🗑️</button></h3>
        <span class="badge ${m[1]}">${m[0]}</span>
        <div class="goal-meta"><span><b>${FX.money(g.saved)}</b> saved</span><span>of <b>${FX.money(g.target)}</b> · ${p}%</span></div>
        <div class="progress"><i style="width:${p}%"></i></div>
        ${need ? `<p style="font-size:.85rem;margin-top:10px">${need}</p>` : ''}
        ${p < 100 ? `<div class="add-fund"><input type="number" min="1" placeholder="Add ₹" data-in="${g.id}"><button class="btn btn-primary btn-sm" data-add="${g.id}">Add</button></div>` : ''}
      </div>`;
    }).join('') : '<div class="card empty" style="grid-column:1/-1"><span class="em">🏝️</span>No goals yet. What are you saving for?</div>';
  }

  $('goalList').addEventListener('click', e => {
    const del = e.target.closest('[data-del]'), add = e.target.closest('[data-add]');
    if (del && confirm('Delete this goal?')) { goals = goals.filter(g => g.id !== del.dataset.del); FX.save('goals', goals); render(); }
    if (add) {
      const input = document.querySelector(`[data-in="${add.dataset.add}"]`), v = Number(input.value);
      if (!(v > 0)) return FX.toast('Enter an amount to add');
      const g = goals.find(x => x.id === add.dataset.add);
      g.saved = Math.min(g.target, g.saved + v); FX.save('goals', goals);
      FX.toast(g.saved >= g.target ? '🎉 Congratulations! Goal achieved!' : '💚 Nice! You are getting closer.');
      render();
    }
  });
  render();
})();
