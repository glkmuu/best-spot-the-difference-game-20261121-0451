// Difference definitions for every round of Lantern Harbor.
// Each difference lives at a fixed scene coordinate (560 x 420 space) so a
// click on either panel can be matched against it. The `kind` tells the
// scene painter which branch to take when drawing the altered panel.
export const DIFFERENCES = {
  harbor: [
    { id: 'gull', label: 'Missing gull', x: 428, y: 66, kind: 'remove' },
    { id: 'lantern', label: 'Lantern colour', x: 300, y: 148, kind: 'recolor' },
    { id: 'crate', label: 'Extra crate', x: 118, y: 330, kind: 'add' },
    { id: 'flag', label: 'Flag direction', x: 92, y: 96, kind: 'flip' },
    { id: 'window', label: 'Lit window', x: 175, y: 209, kind: 'toggle' },
    { id: 'stripe', label: 'Boat stripe', x: 330, y: 318, kind: 'recolor' },
    { id: 'tail', label: "Cat's tail", x: 482, y: 336, kind: 'flip' },
  ],
  market: [
    { id: 'basket', label: 'Missing basket', x: 150, y: 322, kind: 'remove' },
    { id: 'awning', label: 'Awning stripe', x: 262, y: 216, kind: 'recolor' },
    { id: 'melon', label: 'Extra melon', x: 420, y: 330, kind: 'add' },
    { id: 'banner', label: 'Banner shape', x: 360, y: 108, kind: 'flip' },
    { id: 'lamp', label: 'Unlit lamp', x: 110, y: 152, kind: 'toggle' },
    { id: 'star', label: 'Missing star', x: 500, y: 52, kind: 'remove' },
    { id: 'cart', label: 'Cart wheel', x: 210, y: 352, kind: 'recolor' },
    { id: 'cat', label: 'Cat on the roof', x: 470, y: 196, kind: 'add' },
    { id: 'sign', label: 'Sign letter', x: 295, y: 233, kind: 'flip' },
  ],
  garden: [
    { id: 'butterfly', label: 'Missing butterfly', x: 380, y: 96, kind: 'remove' },
    { id: 'flower', label: 'Extra flower', x: 96, y: 356, kind: 'add' },
    { id: 'birdhouse', label: 'Birdhouse roof', x: 452, y: 150, kind: 'recolor' },
    { id: 'stone', label: 'Missing stone', x: 280, y: 372, kind: 'remove' },
    { id: 'can', label: 'Watering can', x: 168, y: 300, kind: 'flip' },
    { id: 'window', label: 'Cottage window', x: 500, y: 216, kind: 'toggle' },
    { id: 'bee', label: 'Extra bee', x: 232, y: 132, kind: 'add' },
    { id: 'tree', label: 'Apple count', x: 76, y: 176, kind: 'remove' },
    { id: 'fence', label: 'Fence plank', x: 330, y: 292, kind: 'recolor' },
    { id: 'pond', label: 'Pond ripple', x: 448, y: 352, kind: 'flip' },
    { id: 'sun', label: 'Sun ray', x: 116, y: 98, kind: 'remove' },
    { id: 'bench', label: 'Bench cushion', x: 396, y: 282, kind: 'recolor' },
  ],
};

// Look up one difference by round id and difference id.
export function findDifference(roundId, diffId) {
  return (DIFFERENCES[roundId] || []).find((d) => d.id === diffId);
}

// Find the nearest still-unfound difference to a scene point, or null.
export function nearestUnfound(roundId, foundIds, x, y, radius) {
  let best = null;
  let bestDist = radius;
  for (const d of DIFFERENCES[roundId] || []) {
    if (foundIds.has(d.id)) continue;
    const dist = Math.hypot(d.x - x, d.y - y);
    if (dist <= bestDist) {
      best = d;
      bestDist = dist;
    }
  }
  return best;
}
