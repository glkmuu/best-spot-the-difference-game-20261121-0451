// Pointer and keyboard input for Lantern Harbor.
// Translates a click on either panel canvas into scene coordinates and
// hands the game logic a "try this point" call; keyboard shortcuts live here.
import { SCENE_WIDTH, SCENE_HEIGHT, HIT_RADIUS } from './config.js';
import { nearestUnfound } from './differences.js';

// Convert a pointer event on a canvas into scene (560 x 420) coordinates.
export function eventToSceneCoords(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * SCENE_WIDTH;
  const y = ((event.clientY - rect.top) / rect.height) * SCENE_HEIGHT;
  return { x, y };
}

// Attach click handling to both panels. `onTry` receives (x, y, foundDiff|null).
export function attachPanelClicks(leftCanvas, rightCanvas, getState, onTry) {
  for (const canvas of [leftCanvas, rightCanvas]) {
    canvas.addEventListener('click', (event) => {
      const state = getState();
      if (state.screen !== 'play') return;
      const { x, y } = eventToSceneCoords(canvas, event);
      const hit = nearestUnfound(state.round.id, state.found, x, y, HIT_RADIUS);
      onTry(x, y, hit);
    });
  }
}

// Attach keyboard shortcuts. `actions` maps keys to game callbacks.
export function attachKeyboard(actions) {
  window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (key === 'h' && actions.hint) actions.hint();
    else if (key === 'n' && actions.next) actions.next();
    else if (key === 'r' && actions.restart) actions.restart();
    else if (key === 'm' && actions.mute) actions.mute();
    else if ((key === 'enter' || key === ' ') && actions.confirm) actions.confirm();
  });
}
