// Deterministic demo states for screenshots (?shot=...).
// These are a dev affordance inside the game itself: the same code path the
// player uses, with a fixed seed and a fixed game state, so a screenshot is
// a real render of the game. ?shot=start | play | end, plus &seed=N and
// &round=1..3 for the play shot.
import { DIFFERENCES } from './differences.js';

export function parseShotParams(search) {
  const params = new URLSearchParams(search);
  const shot = params.get('shot');
  if (!shot) return null;
  const seed = Number.parseInt(params.get('seed') || '1', 10) || 1;
  const round = Math.min(3, Math.max(1, Number.parseInt(params.get('round') || '1', 10) || 1));
  return { shot, seed, round };
}

// Apply a demo state to a fresh state object. Returns the state to use.
export function applyShotState(state, shot) {
  state.seed = shot.seed;
  if (shot.shot === 'start') {
    state.screen = 'title';
    return state;
  }
  state.roundIndex = shot.round - 1;
  state.round = state.rounds[state.roundIndex];
  state.differences = DIFFERENCES[state.round.id];
  if (shot.shot === 'play') {
    state.screen = 'play';
    state.timeLeft = 87;
    state.score = 320;
    // Three differences already found, markers visible, four still hidden.
    state.found = new Set(state.differences.slice(0, 3).map((d) => d.id));
    state.hintsLeft = 2;
    return state;
  }
  if (shot.shot === 'end') {
    state.screen = 'roundComplete';
    state.timeLeft = 42;
    state.score = 640;
    state.found = new Set(state.differences.map((d) => d.id));
    state.hintsLeft = 1;
    return state;
  }
  return state;
}
