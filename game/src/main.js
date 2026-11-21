// Lantern Harbor — game loop and state.
// Owns the state machine (title -> play -> round complete -> game complete),
// the countdown, scoring, markers and the per-frame repaint of both panels.
import { ROUNDS, SCENE_WIDTH, SCENE_HEIGHT, SCORE_FIND, SCORE_WRONG, TIME_PENALTY, TIME_BONUS_PER_SECOND } from './config.js';
import { DIFFERENCES, findDifference } from './differences.js';
import { paintScene, drawFoundMarker, drawHintPulse } from './scene.js';
import { playFoundChime, playWrongThud, playHintBlip, playRoundFanfare, toggleMute, isMuted } from './audio.js';
import { attachPanelClicks, attachKeyboard } from './input.js';
import { updateHud, showScreen, fillRoundComplete, fillGameComplete, flashMessage } from './ui.js';
import { parseShotParams, applyShotState } from './shots.js';

const els = {
  left: document.getElementById('panel-left'),
  right: document.getElementById('panel-right'),
  roundName: document.getElementById('round-name'),
  foundCount: document.getElementById('found-count'),
  timer: document.getElementById('timer'),
  score: document.getElementById('score'),
  hintsLeft: document.getElementById('hints-left'),
  hintButton: document.getElementById('hint-button'),
  muteButton: document.getElementById('mute-button'),
  roundProgress: document.getElementById('round-progress'),
  message: document.getElementById('message'),
  overlay: document.getElementById('overlay'),
  screens: {
    title: document.getElementById('screen-title'),
    roundComplete: document.getElementById('screen-round-complete'),
    gameComplete: document.getElementById('screen-game-complete'),
  },
  completeTitle: document.getElementById('complete-title'),
  completeStars: document.getElementById('complete-stars'),
  completeDetail: document.getElementById('complete-detail'),
  completeScore: document.getElementById('complete-score'),
  nextButton: document.getElementById('next-button'),
  finalScore: document.getElementById('final-score'),
  finalDetail: document.getElementById('final-detail'),
  startButton: document.getElementById('start-button'),
  againButton: document.getElementById('again-button'),
};

const state = {
  screen: 'title',
  rounds: ROUNDS,
  roundIndex: 0,
  round: ROUNDS[0],
  differences: DIFFERENCES[ROUNDS[0].id],
  found: new Set(),
  hintsLeft: ROUNDS[0].hints,
  timeLeft: ROUNDS[0].timeLimit,
  score: 0,
  totalFound: 0,
  seed: 1,
  hint: null,
  shakeUntil: 0,
  lastTick: 0,
};

function alteredSet() {
  return new Set(state.differences.map((d) => d.id));
}

function paintPanels(now) {
  const leftCtx = els.left.getContext('2d');
  const rightCtx = els.right.getContext('2d');
  paintScene(leftCtx, state.round, new Set(), state.seed);
  paintScene(rightCtx, state.round, alteredSet(), state.seed);
  for (const diffId of state.found) {
    const d = findDifference(state.round.id, diffId);
    if (!d) continue;
    drawFoundMarker(leftCtx, d.x, d.y, now);
    drawFoundMarker(rightCtx, d.x, d.y, now);
  }
  if (state.hint && now < state.hint.until) {
    drawHintPulse(leftCtx, state.hint.x, state.hint.y, now);
    drawHintPulse(rightCtx, state.hint.x, state.hint.y, now);
  }
  if (now < state.shakeUntil) {
    const mag = 5;
    const dx = (Math.random() - 0.5) * mag * 2;
    const dy = (Math.random() - 0.5) * mag * 2;
    els.left.style.transform = `translate(${dx}px, ${dy}px)`;
    els.right.style.transform = `translate(${dx}px, ${dy}px)`;
  } else {
    els.left.style.transform = '';
    els.right.style.transform = '';
  }
}

function startRound(index) {
  state.roundIndex = index;
  state.round = ROUNDS[index];
  state.differences = DIFFERENCES[state.round.id];
  state.found = new Set();
  state.hintsLeft = state.round.hints;
  state.timeLeft = state.round.timeLimit;
  state.hint = null;
  state.screen = 'play';
  showScreen(els, null);
  updateHud(state, els);
}

function finishRound(timeUp) {
  const bonus = Math.round(Math.max(0, state.timeLeft)) * TIME_BONUS_PER_SECOND;
  state.score += bonus;
  state.totalFound += state.found.size;
  state.screen = 'roundComplete';
  playRoundFanfare();
  fillRoundComplete(state, els);
  if (timeUp) flashMessage(els, "Time's up — on to the next scene!");
  showScreen(els, 'roundComplete');
  updateHud(state, els);
}

function finishGame() {
  state.screen = 'gameComplete';
  fillGameComplete(state, els);
  showScreen(els, 'gameComplete');
  updateHud(state, els);
}

function nextRound() {
  if (state.screen !== 'roundComplete') return;
  if (state.roundIndex + 1 < ROUNDS.length) startRound(state.roundIndex + 1);
  else finishGame();
}

function restartGame() {
  state.score = 0;
  state.totalFound = 0;
  startRound(0);
}

function tryPoint(x, y, hit) {
  if (state.screen !== 'play') return;
  if (hit) {
    state.found.add(hit.id);
    state.score = Math.max(0, state.score + SCORE_FIND);
    playFoundChime();
    flashMessage(els, `Found it — ${hit.label}! +${SCORE_FIND}`);
    updateHud(state, els);
    if (state.found.size === state.differences.length) finishRound(false);
  } else {
    state.timeLeft = Math.max(0, state.timeLeft - TIME_PENALTY);
    state.score = Math.max(0, state.score + SCORE_WRONG);
    state.shakeUntil = performance.now() + 260;
    playWrongThud();
    flashMessage(els, `Not a difference — minus ${TIME_PENALTY} seconds`);
    updateHud(state, els);
    if (state.timeLeft <= 0) finishRound(true);
  }
}

function useHint() {
  if (state.screen !== 'play' || state.hintsLeft <= 0) return;
  const remaining = state.differences.filter((d) => !state.found.has(d.id));
  if (remaining.length === 0) return;
  const pick = remaining[Math.floor(Math.random() * remaining.length)];
  state.hintsLeft -= 1;
  state.hint = { x: pick.x, y: pick.y, until: performance.now() + 1400 };
  playHintBlip();
  updateHud(state, els);
}

function toggleMuteButton() {
  const nowMuted = toggleMute();
  els.muteButton.textContent = nowMuted ? 'Sound: off (M)' : 'Sound: on (M)';
}

function tick(now) {
  if (state.screen === 'play' && state.lastTick) {
    const dt = (now - state.lastTick) / 1000;
    state.timeLeft -= dt;
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      updateHud(state, els);
      paintPanels(now);
      finishRound(true);
      state.lastTick = now;
      requestAnimationFrame(tick);
      return;
    }
    updateHud(state, els);
  }
  state.lastTick = now;
  paintPanels(now);
  requestAnimationFrame(tick);
}

function init() {
  els.left.width = SCENE_WIDTH;
  els.left.height = SCENE_HEIGHT;
  els.right.width = SCENE_WIDTH;
  els.right.height = SCENE_HEIGHT;
  attachPanelClicks(els.left, els.right, () => state, tryPoint);
  attachKeyboard({
    hint: useHint,
    next: nextRound,
    restart: restartGame,
    mute: toggleMuteButton,
    confirm: () => {
      if (state.screen === 'title') restartGame();
      else if (state.screen === 'roundComplete') nextRound();
      else if (state.screen === 'gameComplete') restartGame();
    },
  });
  els.startButton.addEventListener('click', restartGame);
  els.hintButton.addEventListener('click', useHint);
  els.muteButton.addEventListener('click', toggleMuteButton);
  els.nextButton.addEventListener('click', nextRound);
  els.againButton.addEventListener('click', restartGame);

  const shot = parseShotParams(window.location.search);
  if (shot) {
    applyShotState(state, shot);
    if (state.screen === 'roundComplete') {
      fillRoundComplete(state, els);
      showScreen(els, 'roundComplete');
    } else if (state.screen === 'title') {
      showScreen(els, 'title');
    } else {
      showScreen(els, null);
    }
    updateHud(state, els);
  } else {
    showScreen(els, 'title');
    updateHud(state, els);
  }
  // Exposed for automated play-testing only.
  window.__game = { state, startRound, tryPoint, useHint };
  requestAnimationFrame(tick);
}

init();
