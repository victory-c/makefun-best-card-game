// SPDX-License-Identifier: MIT
// Original vector illustrations: three river spirits, drawn from geometric paths.
export function spiritArt(suit, suffix = '') {
  const id = `glow-${suit}-${suffix}`;
  const shapes = {
    cinder: `<path d="M50 8C59 30 80 34 75 59C72 78 58 87 50 91C31 84 19 70 25 53C29 43 40 37 38 24C48 32 48 41 46 49C60 39 59 25 50 8Z" fill="url(#${id})"/><path d="M49 53C70 69 59 81 50 85C35 78 36 66 49 53Z" fill="#ffeac1"/><path d="M11 80L22 75M80 29L88 18M18 26L23 37M78 84L90 88" stroke="#e9a67e" stroke-width="1.5"/>`,
    tide: `<path d="M6 52Q24 25 44 48T94 43Q85 74 58 74Q35 74 26 60Q16 63 6 52Z" fill="url(#${id})"/><path d="M12 52Q27 46 40 58T84 55M29 79Q52 91 79 78M43 26Q52 12 61 26Q66 37 52 40Q40 37 43 26Z" fill="none" stroke="#b9ece5" stroke-width="2"/><circle cx="74" cy="21" r="2" fill="#9ae2d9"/>`,
    reed: `<path d="M50 90Q49 52 55 20M50 70Q23 69 21 45Q43 44 50 70M51 53Q76 51 79 28Q56 28 51 53M51 82Q77 80 80 58Q59 57 51 82M53 36Q35 30 39 11Q57 19 53 36" fill="url(#${id})" stroke="#d8e7a7" stroke-width="1.4"/><circle cx="22" cy="23" r="2" fill="#d8e7a7"/><circle cx="83" cy="82" r="2" fill="#d8e7a7"/>`,
  };
  const colors = { cinder: ['#ffce89', '#be513c'], tide: ['#a4e2e0', '#397a95'], reed: ['#dceba1', '#557951'] }[suit];
  return `<svg class="spirit-art" viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="${id}" x2="0.7" y2="1"><stop stop-color="${colors[0]}"/><stop offset="1" stop-color="${colors[1]}"/></linearGradient></defs><circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" opacity=".15"/><circle cx="50" cy="50" r="34" fill="none" stroke="currentColor" opacity=".1"/>${shapes[suit]}</svg>`;
}
export function ferrymanArt() {
  return `<svg class="ferryman" viewBox="0 0 650 390" aria-hidden="true"><defs><linearGradient id="boatGlow" x2="0" y2="1"><stop stop-color="#efd49b"/><stop offset="1" stop-color="#b97648"/></linearGradient></defs><g fill="none" stroke="#8bb0b5" opacity=".22"><path d="M8 336Q145 319 294 338T640 332M40 352Q184 340 335 354T616 349M155 369Q285 361 472 368"/><ellipse cx="369" cy="335" rx="179" ry="18"/></g><path d="M174 299Q324 323 539 284L496 321Q339 354 205 327Z" fill="#142b34" stroke="#c1a36e" stroke-width="2"/><path d="M329 295L339 211Q343 170 370 158Q397 178 402 215L428 297Z" fill="#0b1a25" stroke="#68818a"/><path d="M344 182Q348 136 369 134Q392 143 392 180L374 170Z" fill="#112632" stroke="#8f9c94"/><path d="M352 178Q367 185 383 177" stroke="#d4b483" fill="none"/><path d="M398 221L444 185M440 116L464 325" stroke="#bfa77d" stroke-width="5"/><path d="M449 182L484 194L475 228L452 222Z" fill="url(#boatGlow)"/><path d="M454 185L468 175L482 193M452 222L476 228" fill="none" stroke="#d7ba7e" stroke-width="2"/><ellipse cx="469" cy="204" rx="40" ry="48" fill="#efc879" opacity=".06"/><path d="M214 315Q319 331 492 309" stroke="#637c7c" fill="none"/></svg>`;
}
