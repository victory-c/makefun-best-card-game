// SPDX-License-Identifier: MIT
// Pure, deterministic duel rules. The renderer never changes a score.
export const SUITS = [
  { id: 'cinder', name: 'Cinder', glyph: '✹', beats: 'reed', color: '#ef956d' },
  { id: 'tide', name: 'Tide', glyph: '≈', beats: 'cinder', color: '#80cbd4' },
  { id: 'reed', name: 'Reed', glyph: '❧', beats: 'tide', color: '#b9cf8c' },
];
export const CURRENTS = [
  { name: 'Flare', glyph: '✹', reward: '4–7 damage', hint: 'Break their hull', key: 'A' },
  { name: 'Haven', glyph: '≈', reward: '+3 hull · +2 guard', hint: 'Weather the crossing', key: 'S' },
  { name: 'Beacon', glyph: '✦', reward: '+3 light', hint: 'Bring the dawn closer', key: 'D' },
];
export const trait = card => card.rank <= 2 ? 'Echo' : card.rank <= 4 ? 'Keel' : 'Wild';
export const suitOf = card => SUITS.find(s => s.id === card.suit);
export function random(seed) {
  let n = seed >>> 0;
  return () => { n += 0x6D2B79F5; let t = n; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
export function makeDeck(rng, prefix) {
  const deck = SUITS.flatMap(s => Array.from({ length: 6 }, (_, i) => ({ id: `${prefix}-${s.id}-${i + 1}`, suit: s.id, rank: i + 1 })));
  for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; }
  return deck;
}
export function power(card, lane, opposite, partner) {
  if (!card) return { total: 0, base: 0, counter: 0, resonance: 0, keel: 0 };
  const counter = opposite && suitOf(card).beats === opposite.suit ? 2 : 0;
  const resonance = partner?.suit === card.suit ? (trait(card) === 'Echo' ? 3 : 1) : 0;
  const keel = lane === 1 && trait(card) === 'Keel' ? 1 : 0;
  return { total: card.rank + counter + resonance + keel, base: card.rank, counter, resonance, keel };
}
export function powers(slots, enemy) {
  return slots.map((card, lane) => power(card, lane, enemy[lane], slots.find((c, i) => i !== lane && c)));
}
export function evaluate(player, keeper) {
  const a = powers(player, keeper), b = powers(keeper, player);
  return a.map((p, lane) => ({ lane, a: p, b: b[lane], winner: p.total === b[lane].total ? 'tie' : p.total > b[lane].total ? 'player' : 'keeper' }));
}
export function newGame(seed = 1, mode = 'standard') {
  const rng = random(seed), playerDeck = makeDeck(rng, 'p'), keeperDeck = makeDeck(rng, 'k');
  const state = { seed, mode, round: 1, phase: 'planning', player: { hull: 24, guard: 0, light: 0 }, keeper: { hull: 24, guard: 0, light: 0 }, playerDeck, keeperDeck, hand: [], keeperHand: [], slots: [null, null, null], intent: [null, null, null], history: [], outcome: null };
  refill(state); return state;
}
export function refill(s) {
  while (s.hand.length < 5 && s.playerDeck.length) s.hand.push(s.playerDeck.pop());
  while (s.keeperHand.length < 5 && s.keeperDeck.length) s.keeperHand.push(s.keeperDeck.pop());
  s.intent = chooseKeeper(s);
}
export function chooseKeeper(s) {
  // The Keeper values light, but repairs a damaged hull and threatens a weak rival.
  // Intent is committed before the player moves; no hidden reaction or cheating.
  let best = -Infinity, chosen;
  const weights = [s.player.hull <= 10 ? 3.6 : 1.9, s.keeper.hull <= 17 ? 2.7 : 0.8, s.keeper.light >= 10 ? 4 : 3];
  for (let i = 0; i < s.keeperHand.length; i++) for (let j = i + 1; j < s.keeperHand.length; j++) {
    for (let x = 0; x < 3; x++) for (let y = 0; y < 3; y++) if (x !== y) {
      const slots = [null, null, null]; slots[x] = s.keeperHand[i]; slots[y] = s.keeperHand[j];
      const pp = powers(slots, [null, null, null]);
      const value = pp.reduce((v, p, k) => v + (p.total ? weights[k] * (2 + p.total / 3) : 0), 0) - (slots[x].rank + slots[y].rank) * 0.12;
      if (value > best) { best = value; chosen = slots; }
    }
  }
  return chosen ?? [null, null, null];
}
export function placeCard(s, cardId, lane) {
  if (s.phase !== 'planning' || !Number.isInteger(lane) || lane < 0 || lane > 2) return false;
  const card = s.hand.find(c => c.id === cardId);
  if (!card || s.slots.some(c => c?.id === cardId) || s.slots[lane] || s.slots.filter(Boolean).length >= 2) return false;
  s.slots[lane] = card; return true;
}
export function recallCard(s, lane) { if (s.phase === 'planning') s.slots[lane] = null; }
export function resolveRound(s) {
  if (s.phase !== 'planning' || s.slots.filter(Boolean).length !== 2) return null;
  const results = evaluate(s.slots, s.intent), damage = { player: 0, keeper: 0 };
  for (const r of results) {
    if (r.winner === 'tie') continue;
    const side = s[r.winner], other = r.winner === 'player' ? 'keeper' : 'player';
    side.light += 1;
    if (r.lane === 0) damage[other] += 4 + Math.min(3, Math.abs(r.a.total - r.b.total));
    if (r.lane === 1) { side.hull = Math.min(24, side.hull + 3); side.guard += 2; }
    if (r.lane === 2) side.light += 3;
  }
  for (const name of ['player', 'keeper']) {
    const absorbed = Math.min(s[name].guard, damage[name]); s[name].guard -= absorbed;
    s[name].hull = Math.max(0, s[name].hull - damage[name] + absorbed);
  }
  s.history.push({ round: s.round, results, player: { ...s.player }, keeper: { ...s.keeper } });
  s.hand = s.hand.filter(c => !s.slots.some(p => p?.id === c.id));
  s.keeperHand = s.keeperHand.filter(c => !s.intent.some(p => p?.id === c.id));
  const pWins = s.player.light >= 14 || s.keeper.hull === 0;
  const kWins = s.keeper.light >= 14 || s.player.hull === 0;
  if (pWins || kWins || s.round === 7) {
    const lead = s.player.light - s.keeper.light || s.player.hull - s.keeper.hull;
    s.outcome = pWins && !kWins ? 'win' : kWins && !pWins ? 'loss' : lead >= 0 ? 'win' : 'loss';
    s.phase = 'finished';
  } else s.phase = 'resolved';
  return results;
}
export function nextRound(s) {
  if (s.phase !== 'resolved') return false;
  s.round++; s.slots = [null, null, null]; s.phase = 'planning'; refill(s); return true;
}
