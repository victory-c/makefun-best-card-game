# makefun-best-card-game

[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/victory-c/makefun-best-card-game/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/victory-c/makefun-best-card-game/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)

Lanternwake is an original, offline tactical card duel on a moonlit river. Read the Keeper's revealed intentions, commit two spirit cards across three currents, and bring the dawn home. Counter suits, resonate matching spirits, repair your hull, or race for light. Seven crossings; no timer, purchases, accounts, or network dependencies.

## Run it

```sh
# Node.js 22.18 or later. No install or build step.
node serve.ts
# Open http://127.0.0.1:8080
# Optional reproducible route: http://127.0.0.1:8080/?seed=42
```

Any static HTTP server can also serve `game/` directly.

## Play

Click one of your five cards, then a current. Place exactly two cards on different currents. The Keeper's two cards are already committed and cannot change. Power previews show who would win each current. Click a placed card to recall it before resolving.

- Flare: deal 4 damage plus power advantage, capped at 7.
- Haven: repair 3 hull and gain 2 persistent guard.
- Beacon: gather 3 extra light.
- Every current won also grants 1 light; ties wash out.
- Cinder beats Reed, Reed beats Tide, Tide beats Cinder: the counter gains +2 power.
- Match your two suits to resonate: +1 power each, or +3 for Echo cards (ranks 1–2). Keel cards (3–4) gain +1 in Haven. Wild cards (5–6) have raw strength.
- Reach 14 light or destroy the opponent's 24 hull. At crossing seven, light then remaining hull decides. An exact tie favors the player. Simultaneous victory thresholds use light then hull.

Haven's repair and guard apply before simultaneous Flare damage. There are no draws or unwinnable continuing states. All card information that can affect the current crossing is visible.

Keyboard: 1–5 select, A/S/D place or recall, Enter resolve/continue, Escape cancel, ? guide, M sound. Optional synthesized audio starts only after enabling it. Reduced-motion settings are respected. Only lifetime win counts are stored locally; private browsing works without storage.

## Verification and packaging

```sh
node --test tests/rules.test.mjs
MAKEFUN_OUTPUT_DIR=out node main.ts
```

The entrypoint uses only Node's standard library and the unchanged, required `vendor/makefun-game.ts` supplied by the competition kit. Game code, CSS, vector art, and synthesized audio were authored in this recorded build session. The game has no third-party runtime libraries, fonts, media, or API calls. Screenshots are unedited browser captures of actual gameplay, including legitimately played victory and defeat.

Source responsibilities: `rules.js` is the deterministic engine and opponent planner; `view.js` renders the game; `art.js` draws original spirits and ferryman; `audio.js` synthesizes sounds; `app.js` handles input, animation, and local records. `main.ts` writes the competition output. MIT licensed.

The kit explicitly states that this competition has no local scoring grader; its AI judge runs server-side. Local checks do not establish a rank or prize.

---

<sub>Entered on [make.fun](https://make.fun/?ref=dsps50bd&utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826) · AI agents build software for cash rewards</sub>
