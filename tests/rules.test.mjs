// SPDX-License-Identifier: MIT
import assert from 'node:assert/strict';
import test from 'node:test';
import { newGame, random, makeDeck, power, evaluate, placeCard, recallCard, resolveRound, nextRound } from '../game/src/rules.js';
const c = (suit, rank) => ({ id: `${suit}${rank}`, suit, rank });
test('seeded shuffles are stable and complete', () => {
  const a = makeDeck(random(7), 'p');
  assert.deepEqual(a, makeDeck(random(7), 'p'));
  assert.equal(new Set(a.map(card => card.id)).size, 18);
  assert.notDeepEqual(a, makeDeck(random(8), 'p'));
});
test('the suit circle gives +2 only to its counter', () => {
  for (const [a, b] of [['cinder', 'reed'], ['reed', 'tide'], ['tide', 'cinder']]) {
    assert.equal(power(c(a, 5), 0, c(b, 5), null).total, 7);
    assert.equal(power(c(b, 5), 0, c(a, 5), null).total, 5);
    assert.equal(power(c(a, 5), 0, c(a, 5), null).total, 5);
  }
});
test('Echo, Keel and resonance stack as described', () => {
  assert.equal(power(c('tide', 2), 1, c('cinder', 6), c('tide', 3)).total, 7);
  assert.equal(power(c('tide', 3), 1, c('cinder', 6), c('tide', 2)).total, 7);
  assert.equal(power(c('reed', 6), 1, null, c('reed', 5)).total, 7);
  assert.equal(power(null, 0, c('reed', 6), null).total, 0);
});
test('placement cannot duplicate, overwrite or overfill', () => {
  const s = newGame(1), id = s.hand[0].id;
  assert.equal(resolveRound(s), null);
  assert.equal(placeCard(s, id, 0), true);
  assert.equal(placeCard(s, id, 1), false);
  assert.equal(placeCard(s, s.hand[1].id, 0), false);
  assert.equal(placeCard(s, s.hand[1].id, -1), false);
  assert.equal(placeCard(s, s.hand[1].id, 3), false);
  assert.equal(placeCard(s, s.hand[1].id, 1), true);
  assert.equal(placeCard(s, s.hand[2].id, 2), false);
  recallCard(s, 0); assert.equal(placeCard(s, id, 2), true);
  const result = resolveRound(s); assert.equal(result.length, 3);
  assert.equal(placeCard(s, id, 0), false); assert.equal(resolveRound(s), null);
});
test('ties wash out and vacant lanes do not score', () => {
  const results = evaluate([c('tide', 3), null, null], [c('tide', 3), null, null]);
  assert.ok(results.every(r => r.winner === 'tie'));
});
test('Haven repair and guard resolve before simultaneous incoming damage', () => {
  const s = newGame(2); s.player.hull = 15;
  s.slots = [null, c('reed', 6), c('tide', 6)];
  s.intent = [c('cinder', 6), null, c('cinder', 1)];
  resolveRound(s);
  assert.equal(s.player.hull, 13); // 15 + 3 repair - (7 damage - 2 guard)
  assert.equal(s.player.guard, 0); assert.equal(s.player.light, 5);
  assert.equal(s.keeper.light, 1);
});
test('guard persists and hull is capped', () => {
  const s = newGame(3); s.slots = [null, c('tide', 6), c('reed', 6)]; s.intent = [null, null, null];
  resolveRound(s); assert.equal(s.player.hull, 24); assert.equal(s.player.guard, 2);
});
test('light win, hull win, exact tie and simultaneous thresholds terminate', () => {
  const s = newGame(4); s.player.light = 13; s.slots = [c('tide', 6), null, c('reed', 6)]; s.intent = [null, null, null];
  resolveRound(s); assert.equal(s.outcome, 'win'); assert.equal(s.phase, 'finished'); assert.equal(nextRound(s), false);
  const hull = newGame(4); hull.keeper.hull = 1; hull.slots = s.slots; hull.intent = [null, null, null];
  resolveRound(hull); assert.equal(hull.outcome, 'win');
  const tie = newGame(4); tie.round = 7; tie.slots = s.slots; tie.intent = [...s.slots];
  resolveRound(tie); assert.equal(tie.outcome, 'win');
  const both = newGame(4); both.player.light = 13; both.keeper.light = 13;
  both.slots = [null, c('tide', 6), c('reed', 6)]; both.intent = [c('cinder', 6), null, c('reed', 6)];
  resolveRound(both); assert.equal(both.outcome, 'loss');
});
export function moves(s) {
  const choices = [];
  for (let i = 0; i < s.hand.length; i++) for (let j = i + 1; j < s.hand.length; j++) {
    for (let x = 0; x < 3; x++) for (let y = 0; y < 3; y++) if (x !== y) {
      const slots = [null, null, null]; slots[x] = s.hand[i]; slots[y] = s.hand[j]; choices.push(slots);
    }
  }
  return choices;
}
export function bestMove(s, worst = false) {
  let best = -Infinity, chosen;
  for (const slots of moves(s)) {
    const next = structuredClone(s); next.slots = slots; resolveRound(next);
    let value = (next.player.light - next.keeper.light) * 3 + (next.player.hull - next.keeper.hull) * .45 + (next.player.guard - next.keeper.guard) * .3;
    value -= slots.reduce((n, card) => n + (card?.rank ?? 0), 0) * .06;
    if (next.outcome) value += next.outcome === 'win' ? 1000 : -1000;
    if (worst) value = -value;
    if (value > best) { best = value; chosen = slots; }
  }
  return chosen;
}
test('200 seeded journeys finish legally, produce both outcomes and refill correctly', () => {
  let wins = 0, losses = 0, crossings = 0;
  for (let seed = 1; seed <= 200; seed++) {
    const s = newGame(seed);
    while (s.phase !== 'finished') {
      assert.equal(s.hand.length, 5); assert.equal(s.keeperHand.length, 5);
      assert.equal(s.intent.filter(Boolean).length, 2);
      s.slots = seed % 2 ? bestMove(s) : bestMove(s, true);
      resolveRound(s); crossings++;
      for (const side of [s.player, s.keeper]) { assert.ok(side.hull >= 0 && side.hull <= 24); assert.ok(side.guard >= 0); }
      assert.ok(s.round <= 7);
      if (s.phase !== 'finished') nextRound(s);
    }
    s.outcome === 'win' ? wins++ : losses++;
  }
  assert.ok(wins > 0 && losses > 0);
  console.log(JSON.stringify({ seeds: 200, wins, losses, crossings }));
});
