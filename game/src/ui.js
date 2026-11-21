// HUD and screen rendering for Lantern Harbor.
// All DOM text lives here so main.js only owns game state, not markup.
export function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  const m = Math.floor(s / 60);
  const rest = s % 60;
  return `${m}:${String(rest).padStart(2, '0')}`;
}

export function starCount(found, total) {
  if (found === total) return 3;
  if (found >= Math.ceil(total * 0.66)) return 2;
  if (found >= Math.ceil(total * 0.33)) return 1;
  return 0;
}

export function updateHud(state, els) {
  const round = state.round;
  const total = state.differences.length;
  els.roundName.textContent = `${round.name}`;
  els.foundCount.textContent = `Found ${state.found.size} / ${total}`;
  els.timer.textContent = formatTime(state.timeLeft);
  els.timer.classList.toggle('low', state.timeLeft <= 15);
  els.score.textContent = `Score ${state.score}`;
  els.hintsLeft.textContent = `Hints ${state.hintsLeft}`;
  els.hintButton.disabled = state.hintsLeft <= 0 || state.screen !== 'play';
  els.roundProgress.textContent = `Round ${state.roundIndex + 1} / 3`;
}

export function showScreen(els, name) {
  for (const key of ['title', 'roundComplete', 'gameComplete']) {
    els.screens[key].classList.toggle('hidden', key !== name);
  }
  els.overlay.classList.toggle('hidden', name === null);
}

export function fillRoundComplete(state, els) {
  const total = state.differences.length;
  const stars = starCount(state.found.size, total);
  const timeBonus = Math.round(Math.max(0, state.timeLeft)) * 5;
  els.completeTitle.textContent = `${state.round.name} — complete!`;
  els.completeStars.textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
  els.completeDetail.textContent =
    `You found ${state.found.size} of ${total} differences. ` +
    `Time bonus +${timeBonus} points.`;
  els.completeScore.textContent = `Score ${state.score + timeBonus}`;
  els.nextButton.textContent =
    state.roundIndex + 1 < 3 ? 'Next round (N)' : 'See results (N)';
  return timeBonus;
}

export function fillGameComplete(state, els) {
  els.finalScore.textContent = `Total score ${state.score}`;
  els.finalDetail.textContent =
    `You hunted through all 3 scenes of Lantern Harbor — ` +
    `${state.totalFound} differences found in all.`;
}

export function flashMessage(els, text) {
  els.message.textContent = text;
  els.message.classList.remove('hidden');
  clearTimeout(flashMessage._timer);
  flashMessage._timer = setTimeout(() => els.message.classList.add('hidden'), 1600);
}
