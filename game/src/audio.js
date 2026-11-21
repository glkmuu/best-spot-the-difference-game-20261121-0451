// Synthesized sound effects for Lantern Harbor (WebAudio, no audio files).
// Everything is generated with oscillators, so the game needs no network.
let audioCtx = null;
let muted = false;

export function isMuted() {
  return muted;
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

function ensureContext() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function tone(freq, startAt, duration, type, volume) {
  const ctx = ensureContext();
  if (!ctx || muted) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + startAt);
  gain.gain.setValueAtTime(0.0001, ctx.currentTime + startAt);
  gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + startAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startAt + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime + startAt);
  osc.stop(ctx.currentTime + startAt + duration + 0.05);
}

// Pleasant two-note chime when a difference is found.
export function playFoundChime() {
  tone(880, 0, 0.22, 'sine', 0.22);
  tone(1318.5, 0.09, 0.32, 'sine', 0.2);
  tone(1760, 0.18, 0.3, 'triangle', 0.1);
}

// Dull low thud for a wrong click.
export function playWrongThud() {
  tone(140, 0, 0.18, 'sine', 0.28);
  tone(90, 0.02, 0.22, 'triangle', 0.18);
}

// Soft blip when a hint is used.
export function playHintBlip() {
  tone(660, 0, 0.12, 'sine', 0.16);
  tone(990, 0.08, 0.16, 'sine', 0.14);
}

// Little fanfare for finishing a round.
export function playRoundFanfare() {
  tone(523.25, 0, 0.18, 'triangle', 0.2);
  tone(659.25, 0.12, 0.18, 'triangle', 0.2);
  tone(783.99, 0.24, 0.18, 'triangle', 0.2);
  tone(1046.5, 0.36, 0.4, 'triangle', 0.22);
}
