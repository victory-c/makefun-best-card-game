// SPDX-License-Identifier: MIT
import { newGame, placeCard, recallCard, resolveRound, nextRound } from './rules.js';
import { titleView, tableView, outcomeView } from './view.js';
import { playSound, toggleSound } from './audio.js';
const app = document.querySelector('#app'), rules = document.querySelector('#rules');
let state = null, ui = { selected: null, outcome: false, busy: false }, stats = { played: 0, wins: 0 };
try { const saved = JSON.parse(localStorage.getItem('lanternwake-stats')); if (Number.isInteger(saved?.played) && Number.isInteger(saved?.wins)) stats = saved; } catch { /* Private browsing is supported. */ }
function announce(text) { document.querySelector('#announcer').textContent = text; }
function render() {
  app.innerHTML = state ? tableView(state, ui) + (ui.outcome ? outcomeView(state) : '') : titleView(stats);
  if (ui.busy) app.classList.add('resolving'); else app.classList.remove('resolving');
}
function start(seed) {
  const parameter = new URLSearchParams(location.search).get('seed');
  const route = seed ?? (parameter && /^\d{1,10}$/.test(parameter) ? Number(parameter) >>> 0 : crypto.getRandomValues(new Uint32Array(1))[0]);
  state = newGame(route); ui = { selected: null, outcome: false, busy: false }; render(); playSound('start');
  announce('Crossing 1. The Keeper has revealed two cards. Choose two spirits.');
}
function select(id) {
  if (!state || state.phase !== 'planning' || state.slots.some(c => c?.id === id)) return;
  ui.selected = ui.selected === id ? null : id; playSound('select'); render();
}
function place(lane) {
  if (!state || state.phase !== 'planning') return;
  if (state.slots[lane]) { recallCard(state, lane); ui.selected = null; playSound('recall'); render(); return; }
  if (!ui.selected) { announce('Choose a card from your hand first.'); return; }
  if (placeCard(state, ui.selected, lane)) { ui.selected = null; playSound('place'); render(); announce('Spirit placed. Click the placed card to recall it.'); }
}
function lights(win) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  for (let i = 0; i < (win ? 26 : 8); i++) {
    const light = document.createElement('span'); light.className = 'float-light'; light.textContent = win ? '✦' : '·';
    light.style.left = `${12 + Math.random() * 76}vw`; light.style.top = `${45 + Math.random() * 45}vh`; light.style.animationDelay = `${Math.random() * 0.8}s`;
    document.body.append(light); setTimeout(() => light.remove(), 3300);
  }
}
function showOutcome() {
  ui.outcome = true; render(); playSound(state.outcome); lights(state.outcome === 'win');
  document.querySelector('#rematch')?.focus({ preventScroll: true });
}
function resolve() {
  if (!state || ui.busy || ui.outcome) return;
  if (state.phase === 'finished') { showOutcome(); return; }
  if (state.phase === 'resolved') { nextRound(state); ui.selected = null; render(); playSound('start'); announce(`Crossing ${state.round}. Intent revealed.`); return; }
  if (state.slots.filter(Boolean).length !== 2) { announce('Place exactly two cards on different currents.'); return; }
  resolveRound(state); ui.selected = null; ui.busy = true; playSound('resolve'); render();
  announce(`Crossing resolved. Your light ${state.player.light}; Keeper light ${state.keeper.light}.`);
  const current = state;
  setTimeout(() => {
    if (state !== current) return;
    ui.busy = false;
    if (state.phase === 'finished') {
      stats.played++; if (state.outcome === 'win') stats.wins++;
      try { localStorage.setItem('lanternwake-stats', JSON.stringify(stats)); } catch { /* Storage is optional. */ }
      showOutcome();
    } else { render(); lights(true); document.querySelector('#resolve')?.focus({ preventScroll: true }); }
  }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 50 : 850);
}
function home() { state = null; ui = { selected: null, outcome: false, busy: false }; render(); }
app.addEventListener('click', event => {
  const target = event.target.closest('button'); if (!target || ui.busy) return;
  if (target.id === 'start' || target.id === 'rematch') start();
  else if (target.id === 'replay') start(state.seed);
  else if (target.id === 'home') home();
  else if (target.id === 'learn') rules.showModal();
  else if (target.id === 'resolve') resolve();
  else if (target.dataset.lane !== undefined) place(Number(target.dataset.lane));
  else if (target.dataset.card && state) {
    const lane = state.slots.findIndex(c => c?.id === target.dataset.card);
    if (lane >= 0) place(lane); else select(target.dataset.card);
  }
});
document.querySelector('#help').addEventListener('click', () => rules.showModal());
rules.querySelector('.close').addEventListener('click', () => rules.close());
rules.addEventListener('click', event => { if (event.target === rules) { const r = rules.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) rules.close(); } });
document.querySelector('#sound').addEventListener('click', async () => {
  try { const on = await toggleSound(); document.querySelector('#sound').textContent = on ? 'Sound on' : 'Sound off'; document.querySelector('#sound').setAttribute('aria-pressed', String(on)); } catch { announce('Audio is unavailable in this browser.'); }
});
document.addEventListener('keydown', event => {
  if (event.ctrlKey || event.metaKey || event.altKey || event.repeat || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
  if (event.key === 'Escape') { if (rules.open) rules.close(); else if (ui.selected) { ui.selected = null; render(); } return; }
  if (rules.open) return;
  if (event.key === '?') { event.preventDefault(); rules.showModal(); return; }
  if (event.key.toLowerCase() === 'm') { document.querySelector('#sound').click(); return; }
  if (ui.busy || ui.outcome) return;
  if (!state) { if (event.key === 'Enter' && event.target.tagName !== 'BUTTON') start(); return; }
  const key = event.key.toLowerCase();
  if (/^[1-5]$/.test(key)) { event.preventDefault(); const card = state.hand[Number(key) - 1]; if (card) select(card.id); }
  if ('asd'.includes(key) && key.length === 1) { event.preventDefault(); place('asd'.indexOf(key)); }
  if (key === 'enter' && event.target.tagName !== 'BUTTON') { event.preventDefault(); resolve(); }
});
render();
