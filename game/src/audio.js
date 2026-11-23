// SPDX-License-Identifier: MIT
// Quiet, original synthesized bells and river chords. No sound assets or network.
let context, enabled = false, ambient;
export function soundEnabled() { return enabled; }
function tone(frequency, time, duration, volume = 0.08, type = 'sine') {
  if (!enabled || !context) return;
  const oscillator = context.createOscillator(), gain = context.createGain();
  oscillator.type = type; oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0, time); gain.gain.linearRampToValueAtTime(volume, time + 0.018);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
  oscillator.connect(gain).connect(context.destination); oscillator.start(time); oscillator.stop(time + duration + 0.02);
}
export async function toggleSound() {
  if (!context) context = new AudioContext();
  await context.resume(); enabled = !enabled;
  if (enabled) { playSound('start'); ambient = setInterval(() => {
    const base = [146.83, 164.81, 196, 220][Math.floor(Math.random() * 4)];
    tone(base, context.currentTime, 3.5, 0.012); tone(base * 1.5, context.currentTime + 0.6, 3, 0.009);
  }, 4400); } else clearInterval(ambient);
  return enabled;
}
export function playSound(event) {
  if (!enabled || !context) return;
  const now = context.currentTime;
  const notes = { select: [440], place: [293.66, 440], recall: [329.63, 220], start: [220, 293.66, 440], resolve: [146.83, 220, 293.66], win: [293.66, 369.99, 440, 587.33], loss: [293.66, 261.63, 220, 146.83] }[event] ?? [220];
  notes.forEach((frequency, i) => tone(frequency, now + i * 0.1, event === 'win' ? 1.8 : 0.8, event === 'select' ? 0.025 : 0.045));
}
