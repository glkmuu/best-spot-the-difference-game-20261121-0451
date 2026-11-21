// Procedural scene painting for Lantern Harbor.
// One seeded painter draws both panels: the left panel with no alterations,
// the right panel with the round's differences applied. All art is original
// canvas drawing — no images, no external assets.
import { SCENE_WIDTH, SCENE_HEIGHT } from './config.js';

// Small deterministic random generator so decorative detail is stable.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function nextRandom() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function skyGradient(ctx, round) {
  const g = ctx.createLinearGradient(0, 0, 0, 270);
  g.addColorStop(0, round.skyTop);
  g.addColorStop(0.55, round.skyMid);
  g.addColorStop(1, round.skyLow);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SCENE_WIDTH, 270);
}

function drawStars(ctx, rng, altered, skipId) {
  ctx.fillStyle = '#fff8d6';
  for (let i = 0; i < 42; i++) {
    const x = 20 + rng() * 520;
    const y = 12 + rng() * 120;
    if (skipId && altered.has(skipId) && Math.hypot(x - 500, y - 52) < 18) continue;
    const r = 0.8 + rng() * 1.4;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCloud(ctx, x, y, scale, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, 42 * scale, 13 * scale, 0, 0, Math.PI * 2);
  ctx.ellipse(x - 28 * scale, y + 5 * scale, 26 * scale, 10 * scale, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 30 * scale, y + 5 * scale, 28 * scale, 10 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawGull(ctx, x, y) {
  ctx.strokeStyle = '#1c2436';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 9, y);
  ctx.quadraticCurveTo(x - 3, y - 7, x, y);
  ctx.quadraticCurveTo(x + 3, y - 7, x + 9, y);
  ctx.stroke();
}

function drawLantern(ctx, x, y, color, lit) {
  ctx.strokeStyle = '#3a2a1a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x, y - 12);
  ctx.lineTo(x, y - 4);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y + 4, 8, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3a2a1a';
  ctx.fillRect(x - 3, y - 7, 6, 3);
  ctx.fillRect(x - 3, y + 12, 6, 3);
  if (lit) {
    ctx.fillStyle = 'rgba(255, 220, 120, 0.85)';
    ctx.beginPath();
    ctx.ellipse(x, y + 4, 4, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBoat(ctx, x, y, hull, stripe, sail) {
  ctx.strokeStyle = '#2a1c10';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y - 46);
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.fillStyle = sail;
  ctx.beginPath();
  ctx.moveTo(x + 3, y - 44);
  ctx.lineTo(x + 3, y - 6);
  ctx.lineTo(x + 34, y - 6);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = hull;
  ctx.beginPath();
  ctx.moveTo(x - 34, y);
  ctx.lineTo(x + 40, y);
  ctx.lineTo(x + 28, y + 14);
  ctx.lineTo(x - 24, y + 14);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = stripe;
  ctx.fillRect(x - 30, y + 4, 62, 5);
}

function drawCrate(ctx, x, y) {
  ctx.fillStyle = '#a8763e';
  ctx.fillRect(x - 13, y - 13, 26, 26);
  ctx.strokeStyle = '#6d4a22';
  ctx.lineWidth = 2;
  ctx.strokeRect(x - 13, y - 13, 26, 26);
  ctx.beginPath();
  ctx.moveTo(x - 13, y - 13);
  ctx.lineTo(x + 13, y + 13);
  ctx.moveTo(x + 13, y - 13);
  ctx.lineTo(x - 13, y + 13);
  ctx.stroke();
}

function drawCat(ctx, x, y, tailUp) {
  ctx.fillStyle = '#e8a34c';
  ctx.beginPath();
  ctx.ellipse(x, y, 16, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 14, y - 8, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 8, y - 15);
  ctx.lineTo(x + 10, y - 22);
  ctx.lineTo(x + 14, y - 15);
  ctx.closePath();
  ctx.moveTo(x + 16, y - 15);
  ctx.lineTo(x + 18, y - 22);
  ctx.lineTo(x + 21, y - 15);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#e8a34c';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x - 15, y - 2);
  if (tailUp) {
    ctx.quadraticCurveTo(x - 24, y - 12, x - 20, y - 26);
  } else {
    ctx.quadraticCurveTo(x - 26, y + 6, x - 18, y + 12);
  }
  ctx.stroke();
  ctx.fillStyle = '#1c2436';
  ctx.beginPath();
  ctx.arc(x + 17, y - 9, 1.6, 0, Math.PI * 2);
  ctx.fill();
}

function drawHouse(ctx, x, y, w, h, wall, litWindows, darkWindows) {
  ctx.fillStyle = wall;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#4a2c1e';
  ctx.beginPath();
  ctx.moveTo(x - 6, y);
  ctx.lineTo(x + w / 2, y - 26);
  ctx.lineTo(x + w + 6, y);
  ctx.closePath();
  ctx.fill();
  for (const [wx, wy] of litWindows) {
    ctx.fillStyle = '#ffd873';
    ctx.fillRect(x + wx, y + wy, 14, 18);
    ctx.strokeStyle = '#4a2c1e';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + wx, y + wy, 14, 18);
  }
  for (const [wx, wy] of darkWindows) {
    ctx.fillStyle = '#22303f';
    ctx.fillRect(x + wx, y + wy, 14, 18);
    ctx.strokeStyle = '#4a2c1e';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + wx, y + wy, 14, 18);
  }
}

// ---- Round 1: Lantern Harbor at Dusk ----
function paintHarbor(ctx, altered, seed) {
  const rng = mulberry32(seed);
  const round = { skyTop: '#2b2a55', skyMid: '#7a4a7d', skyLow: '#e8805a' };
  skyGradient(ctx, round);
  drawStars(ctx, rng, altered, null);
  // Setting sun with glow.
  const glow = ctx.createRadialGradient(470, 88, 6, 470, 88, 70);
  glow.addColorStop(0, 'rgba(255, 190, 90, 0.9)');
  glow.addColorStop(1, 'rgba(255, 190, 90, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(390, 8, 160, 160);
  ctx.fillStyle = '#ffcf6e';
  ctx.beginPath();
  ctx.arc(470, 88, 26, 0, Math.PI * 2);
  ctx.fill();
  drawCloud(ctx, 150, 60, 1, 'rgba(255, 170, 150, 0.5)');
  drawCloud(ctx, 330, 110, 0.7, 'rgba(255, 170, 150, 0.4)');
  // Gulls — one goes missing on the altered panel.
  if (!altered.has('gull')) drawGull(ctx, 428, 66);
  drawGull(ctx, 352, 44);
  drawGull(ctx, 498, 82);
  // Distant hills.
  ctx.fillStyle = '#3c2a52';
  ctx.beginPath();
  ctx.moveTo(0, 252);
  ctx.quadraticCurveTo(140, 196, 300, 246);
  ctx.quadraticCurveTo(430, 216, 560, 252);
  ctx.lineTo(560, 272);
  ctx.lineTo(0, 272);
  ctx.closePath();
  ctx.fill();
  // Sea.
  const sea = ctx.createLinearGradient(0, 258, 0, 420);
  sea.addColorStop(0, '#274b63');
  sea.addColorStop(1, '#16303f');
  ctx.fillStyle = sea;
  ctx.fillRect(0, 258, 560, 162);
  ctx.strokeStyle = 'rgba(255, 200, 130, 0.35)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 9; i++) {
    const wy = 282 + i * 15;
    ctx.beginPath();
    for (let x = 0; x <= 560; x += 28) {
      const yy = wy + Math.sin((x + i * 40) / 34) * 3;
      if (x === 0) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }
  // Buildings along the quay.
  drawHouse(ctx, 150, 178, 90, 82, '#8a5a44', [[18, 22]], [[58, 22]]);
  const winLit = altered.has('window');
  drawHouse(ctx, 252, 168, 96, 92, '#6b4a5e', [[20, 20]], [[58, 20]]);
  // The watched window sits at scene (205, 208): house 1's lit window.
  ctx.fillStyle = winLit ? '#22303f' : '#ffd873';
  ctx.fillRect(168, 200, 14, 18);
  ctx.strokeStyle = '#4a2c1e';
  ctx.strokeRect(168, 200, 14, 18);
  drawHouse(ctx, 362, 182, 84, 78, '#7a6a3e', [[16, 20]], [[52, 20]]);
  // Lighthouse.
  ctx.fillStyle = '#f2e8d5';
  ctx.fillRect(58, 108, 34, 152);
  ctx.fillStyle = '#c65a4a';
  ctx.fillRect(58, 132, 34, 12);
  ctx.fillRect(58, 168, 34, 12);
  ctx.fillRect(58, 204, 34, 12);
  ctx.fillStyle = '#2b2a55';
  ctx.fillRect(52, 92, 46, 18);
  ctx.fillStyle = '#ffe9a8';
  ctx.fillRect(60, 97, 30, 8);
  // Flag on the lighthouse: points right, or left when altered.
  ctx.strokeStyle = '#2b2a55';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(92, 92);
  ctx.lineTo(92, 66);
  ctx.stroke();
  ctx.fillStyle = '#e84a4a';
  ctx.beginPath();
  ctx.moveTo(92, 66);
  if (altered.has('flag')) {
    ctx.lineTo(70, 72);
    ctx.lineTo(92, 78);
  } else {
    ctx.lineTo(114, 72);
    ctx.lineTo(92, 78);
  }
  ctx.closePath();
  ctx.fill();
  // Pier.
  ctx.fillStyle = '#7a5230';
  ctx.fillRect(30, 300, 500, 14);
  ctx.fillStyle = '#5d3c22';
  for (let x = 44; x < 530; x += 34) ctx.fillRect(x, 300, 4, 14);
  ctx.fillStyle = '#4a2c1e';
  ctx.fillRect(48, 314, 10, 40);
  ctx.fillRect(500, 314, 10, 40);
  // Lantern string across the pier.
  ctx.strokeStyle = '#2b2a55';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(60, 132);
  ctx.quadraticCurveTo(280, 168, 510, 128);
  ctx.stroke();
  const lanternXs = [110, 180, 240, 300, 360, 430, 480];
  for (const lx of lanternXs) {
    const ly = 132 + Math.sin((lx - 60) / 450 * Math.PI) * 22;
    const color = lx === 300 ? (altered.has('lantern') ? '#2fb3a3' : '#e84a4a') : '#e84a4a';
    drawLantern(ctx, lx, ly, color, true);
  }
  // Boats.
  drawBoat(ctx, 180, 300, '#7a3b2e', '#f2e8d5', '#f6ead0');
  drawBoat(ctx, 330, 318, '#3e5a7a', altered.has('stripe') ? '#3fae5a' : '#3a7bd5', '#ffe9a8');
  drawBoat(ctx, 452, 292, '#5a7a3e', '#f2e8d5', '#d8ecf6');
  // Crates on the pier — one extra appears when altered.
  drawCrate(ctx, 80, 332);
  drawCrate(ctx, 150, 336);
  if (altered.has('crate')) drawCrate(ctx, 118, 330);
  // The pier cat, tail up or drooping.
  drawCat(ctx, 482, 336, !altered.has('tail'));
}

// ---- Round 2: Night Market ----
function paintMarket(ctx, altered, seed) {
  const rng = mulberry32(seed + 7);
  const round = { skyTop: '#101a3a', skyMid: '#233a6b', skyLow: '#3d5a8a' };
  skyGradient(ctx, round);
  drawStars(ctx, rng, altered, null);
  // One bright star sits at (500, 52); it is gone on the altered panel.
  if (!altered.has('star')) {
    ctx.fillStyle = '#fff8d6';
    ctx.beginPath();
    ctx.moveTo(500, 42);
    ctx.lineTo(503, 49);
    ctx.lineTo(510, 52);
    ctx.lineTo(503, 55);
    ctx.lineTo(500, 62);
    ctx.lineTo(497, 55);
    ctx.lineTo(490, 52);
    ctx.lineTo(497, 49);
    ctx.closePath();
    ctx.fill();
  }
  // Moon.
  ctx.fillStyle = '#f4ecd0';
  ctx.beginPath();
  ctx.arc(80, 58, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ddd2ae';
  ctx.beginPath();
  ctx.arc(72, 52, 5, 0, Math.PI * 2);
  ctx.arc(88, 64, 4, 0, Math.PI * 2);
  ctx.fill();
  drawCloud(ctx, 300, 70, 0.9, 'rgba(120, 140, 190, 0.45)');
  // Street.
  ctx.fillStyle = '#4a3a52';
  ctx.fillRect(0, 300, 560, 120);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1;
  for (let y = 316; y < 420; y += 22) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(560, y);
    ctx.stroke();
  }
  for (let x = 20; x < 560; x += 46) {
    ctx.beginPath();
    ctx.moveTo(x, 300);
    ctx.lineTo(x - 14, 420);
    ctx.stroke();
  }
  // Stall painter: awning, counter, goods.
  function stall(x, w, awningA, awningB, signText, signFlip) {
    ctx.fillStyle = '#6d4a22';
    ctx.fillRect(x, 236, w, 66);
    ctx.fillStyle = '#8a5a34';
    ctx.fillRect(x - 6, 236, w + 12, 10);
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = i % 2 === 0 ? awningA : awningB;
      ctx.fillRect(x - 6 + (i * (w + 12)) / 6, 196, (w + 12) / 6, 40);
    }
    ctx.fillStyle = '#2b2a55';
    ctx.fillRect(x + w / 2 - 34, 222, 68, 22);
    ctx.fillStyle = '#ffe9a8';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(signFlip ? signText.split('').reverse().join('') : signText, x + w / 2, 233);
    ctx.fillStyle = '#e8a34c';
    ctx.beginPath();
    ctx.arc(x + 26, 226, 7, 0, Math.PI * 2);
    ctx.arc(x + w - 26, 226, 7, 0, Math.PI * 2);
    ctx.fill();
  }
  stall(56, 150, '#c65a4a', '#f2e8d5', 'FRUIT', false);
  stall(230, 130, altered.has('awning') ? '#3a7bd5' : '#c65a4a', '#f2e8d5', 'FISH', altered.has('sign'));
  stall(396, 130, '#3fae5a', '#f2e8d5', 'TEA', false);
  // Fruit and goods on the counters.
  const fruits = ['#e84a4a', '#f2a541', '#7ac74f', '#c65a8a'];
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = fruits[i % 4];
    ctx.beginPath();
    ctx.arc(76 + i * 16, 232, 7, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#7ac7e8';
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.ellipse(252 + i * 22, 232, 9, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#8a5a34';
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(412 + i * 28, 220, 20, 16);
  }
  // Hanging banner between stalls, point down or up.
  ctx.strokeStyle = '#2b2a55';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(330, 120);
  ctx.lineTo(390, 120);
  ctx.stroke();
  ctx.fillStyle = '#ffd873';
  ctx.beginPath();
  if (altered.has('banner')) {
    ctx.moveTo(336, 108);
    ctx.lineTo(384, 108);
    ctx.lineTo(360, 88);
  } else {
    ctx.moveTo(336, 92);
    ctx.lineTo(384, 92);
    ctx.lineTo(360, 116);
  }
  ctx.closePath();
  ctx.fill();
  // String lights.
  ctx.strokeStyle = '#1c2436';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(40, 140);
  ctx.quadraticCurveTo(280, 168, 520, 136);
  ctx.stroke();
  for (let i = 0; i < 9; i++) {
    const lx = 60 + i * 50;
    const ly = 140 + Math.sin((lx - 40) / 480 * Math.PI) * 16;
    const lit = !(lx === 110 && altered.has('lamp'));
    ctx.fillStyle = lit ? '#ffe9a8' : '#5a5a6a';
    ctx.beginPath();
    ctx.arc(lx, ly + 6, lit ? 6 : 4, 0, Math.PI * 2);
    ctx.fill();
    if (lit) {
      ctx.fillStyle = 'rgba(255, 233, 168, 0.25)';
      ctx.beginPath();
      ctx.arc(lx, ly + 6, 12, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // Basket of fruit on the ground — missing when altered.
  if (!altered.has('basket')) {
    ctx.fillStyle = '#8a5a34';
    ctx.beginPath();
    ctx.ellipse(150, 330, 24, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e84a4a';
    ctx.beginPath();
    ctx.arc(140, 320, 7, 0, Math.PI * 2);
    ctx.arc(156, 318, 7, 0, Math.PI * 2);
    ctx.arc(148, 310, 7, 0, Math.PI * 2);
    ctx.fill();
  }
  // Extra melon on the ground when altered.
  if (altered.has('melon')) {
    ctx.fillStyle = '#3fae5a';
    ctx.beginPath();
    ctx.ellipse(420, 336, 18, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2a7a3e';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(420, 336, 11, 8, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Vendor cart with a wheel whose hub changes colour.
  ctx.fillStyle = '#7a5230';
  ctx.fillRect(180, 330, 70, 26);
  ctx.fillStyle = '#5d3c22';
  ctx.fillRect(180, 330, 70, 6);
  ctx.strokeStyle = '#2b2a55';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(210, 362, 12, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = altered.has('cart') ? '#ffd873' : '#e84a4a';
  ctx.beginPath();
  ctx.arc(210, 362, 5, 0, Math.PI * 2);
  ctx.fill();
  // Cat on the right stall's roof — only on the altered panel.
  if (altered.has('cat')) drawCat(ctx, 470, 196, true);
  // Paper lanterns hanging from stall C.
  drawLantern(ctx, 420, 210, '#e84a4a', true);
  drawLantern(ctx, 500, 210, '#ffd873', true);
}

// ---- Round 3: Garden Morning ----
function paintGarden(ctx, altered, seed) {
  const rng = mulberry32(seed + 13);
  const round = { skyTop: '#7ec8e3', skyMid: '#bfe6f2', skyLow: '#fdf0c0' };
  skyGradient(ctx, round);
  // Sun with rays — one ray missing when altered.
  ctx.fillStyle = '#ffd23e';
  ctx.beginPath();
  ctx.arc(116, 60, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffd23e';
  ctx.lineWidth = 4;
  for (let a = 0; a < 8; a++) {
    if (altered.has('sun') && a === 2) continue;
    const ang = (a * Math.PI) / 4;
    ctx.beginPath();
    ctx.moveTo(116 + Math.cos(ang) * 32, 60 + Math.sin(ang) * 32);
    ctx.lineTo(116 + Math.cos(ang) * 44, 60 + Math.sin(ang) * 44);
    ctx.stroke();
  }
  drawCloud(ctx, 300, 56, 1, 'rgba(255, 255, 255, 0.85)');
  drawCloud(ctx, 460, 100, 0.7, 'rgba(255, 255, 255, 0.7)');
  // Grass.
  const grass = ctx.createLinearGradient(0, 250, 0, 420);
  grass.addColorStop(0, '#5fae7a');
  grass.addColorStop(1, '#3d8a58');
  ctx.fillStyle = grass;
  ctx.fillRect(0, 250, 560, 170);
  ctx.strokeStyle = 'rgba(20, 80, 40, 0.5)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 40; i++) {
    const gx = 10 + rng() * 540;
    const gy = 262 + rng() * 150;
    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.lineTo(gx + 3, gy - 7);
    ctx.stroke();
  }
  // Big tree on the left with apples — one apple fewer when altered.
  ctx.fillStyle = '#6d4a22';
  ctx.fillRect(68, 190, 16, 76);
  ctx.fillStyle = '#3d8a3e';
  ctx.beginPath();
  ctx.arc(76, 150, 52, 0, Math.PI * 2);
  ctx.arc(40, 176, 34, 0, Math.PI * 2);
  ctx.arc(112, 176, 34, 0, Math.PI * 2);
  ctx.fill();
  const apples = [[52, 150], [76, 176], [100, 150], [60, 186]];
  apples.forEach(([ax, ay], i) => {
    if (altered.has('tree') && i === 1) return;
    ctx.fillStyle = '#e84a4a';
    ctx.beginPath();
    ctx.arc(ax, ay, 6, 0, Math.PI * 2);
    ctx.fill();
  });
  // Cottage on the right with a window that lights or darkens.
  ctx.fillStyle = '#f2e8d5';
  ctx.fillRect(452, 176, 88, 84);
  ctx.fillStyle = '#c65a4a';
  ctx.beginPath();
  ctx.moveTo(444, 176);
  ctx.lineTo(496, 138);
  ctx.lineTo(548, 176);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = altered.has('window') ? '#22303f' : '#ffd873';
  ctx.fillRect(492, 208, 16, 20);
  ctx.strokeStyle = '#4a2c1e';
  ctx.lineWidth = 2;
  ctx.strokeRect(492, 208, 16, 20);
  ctx.fillStyle = '#6d4a22';
  ctx.fillRect(528, 222, 12, 38);
  // Birdhouse on a pole.
  ctx.fillStyle = '#6d4a22';
  ctx.fillRect(448, 168, 6, 60);
  ctx.fillStyle = '#8a5a34';
  ctx.fillRect(436, 138, 32, 30);
  ctx.fillStyle = altered.has('birdhouse') ? '#3a7bd5' : '#c65a4a';
  ctx.beginPath();
  ctx.moveTo(432, 140);
  ctx.lineTo(452, 122);
  ctx.lineTo(472, 140);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#22303f';
  ctx.beginPath();
  ctx.arc(452, 152, 5, 0, Math.PI * 2);
  ctx.fill();
  // Fence across the middle.
  ctx.fillStyle = '#a8763e';
  ctx.fillRect(180, 288, 220, 8);
  for (let x = 190; x <= 390; x += 28) {
    ctx.fillStyle = x === 330 && altered.has('fence') ? '#c65a4a' : '#c9a35f';
    ctx.fillRect(x, 272, 14, 40);
  }
  // Path stones — one missing when altered.
  const stones = [[240, 340], [280, 372], [320, 340], [280, 308], [360, 372]];
  for (const [sx, sy] of stones) {
    if (altered.has('stone') && sx === 280 && sy === 372) continue;
    ctx.fillStyle = '#d8d0c0';
    ctx.beginPath();
    ctx.ellipse(sx, sy, 22, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#a89e88';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  // Pond with ripples that flip direction.
  ctx.fillStyle = '#5fa8d8';
  ctx.beginPath();
  ctx.ellipse(448, 356, 62, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    if (altered.has('pond')) {
      ctx.arc(448, 356, 14 + i * 12, Math.PI * 0.9, Math.PI * 1.9);
    } else {
      ctx.arc(448, 356, 14 + i * 12, Math.PI * 1.1, Math.PI * 0.1);
    }
    ctx.stroke();
  }
  // Bench with a cushion that changes colour.
  ctx.fillStyle = '#6d4a22';
  ctx.fillRect(372, 272, 52, 8);
  ctx.fillRect(376, 280, 6, 18);
  ctx.fillRect(414, 280, 6, 18);
  ctx.fillStyle = altered.has('bench') ? '#3a7bd5' : '#e84a4a';
  ctx.fillRect(376, 264, 44, 10);
  // Flowers — one extra blooms when altered.
  const flowerSpots = [[40, 380], [120, 392], [200, 380], [300, 396], [520, 380], [96, 356]];
  flowerSpots.forEach(([fx, fy], i) => {
    if (i === 5 && !altered.has('flower')) return;
    ctx.strokeStyle = '#2a7a3e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(fx, fy - 14);
    ctx.stroke();
    ctx.fillStyle = ['#e84a8a', '#ffd23e', '#c65a8a', '#ff8a3e', '#b45ae8', '#e84a4a'][i];
    for (let p = 0; p < 5; p++) {
      const ang = (p * Math.PI * 2) / 5;
      ctx.beginPath();
      ctx.arc(fx + Math.cos(ang) * 5, fy - 16 + Math.sin(ang) * 5, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#fff3b0';
    ctx.beginPath();
    ctx.arc(fx, fy - 16, 3, 0, Math.PI * 2);
    ctx.fill();
  });
  // Butterfly — missing when altered.
  if (!altered.has('butterfly')) {
    ctx.fillStyle = '#b45ae8';
    ctx.beginPath();
    ctx.ellipse(372, 92, 8, 11, -0.5, 0, Math.PI * 2);
    ctx.ellipse(388, 92, 8, 11, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd23e';
    ctx.beginPath();
    ctx.arc(380, 96, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  // Bee — extra when altered.
  if (altered.has('bee')) {
    ctx.fillStyle = '#ffd23e';
    ctx.beginPath();
    ctx.ellipse(232, 132, 7, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#22303f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(230, 128);
    ctx.lineTo(230, 136);
    ctx.moveTo(234, 128);
    ctx.lineTo(234, 136);
    ctx.stroke();
  }
  // Watering can, spout left or right.
  ctx.fillStyle = '#7a8a99';
  ctx.fillRect(156, 292, 26, 18);
  ctx.beginPath();
  ctx.moveTo(156, 296);
  if (altered.has('can')) {
    ctx.lineTo(138, 288);
    ctx.lineTo(140, 296);
  } else {
    ctx.lineTo(182, 288);
    ctx.lineTo(180, 296);
  }
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#5a6a79';
  ctx.beginPath();
  ctx.arc(168, 288, 5, 0, Math.PI * 2);
  ctx.fill();
}

// Paint one panel. `altered` is a Set of difference ids to apply.
export function paintScene(ctx, round, altered, seed) {
  ctx.clearRect(0, 0, SCENE_WIDTH, SCENE_HEIGHT);
  if (round.id === 'harbor') paintHarbor(ctx, altered, seed);
  else if (round.id === 'market') paintMarket(ctx, altered, seed);
  else paintGarden(ctx, altered, seed);
}

// Draw a found marker: a glowing ring plus a check, on both panels.
export function drawFoundMarker(ctx, x, y, pulse) {
  const r = 22 + Math.sin(pulse / 180) * 2;
  ctx.strokeStyle = '#2fd47a';
  ctx.lineWidth = 4;
  ctx.shadowColor = 'rgba(47, 212, 122, 0.8)';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x - 8, y);
  ctx.lineTo(x - 2, y + 7);
  ctx.lineTo(x + 10, y - 7);
  ctx.stroke();
}

// Draw a hint pulse: a dashed amber circle that fades in and out.
export function drawHintPulse(ctx, x, y, phase) {
  const alpha = 0.35 + 0.45 * Math.abs(Math.sin(phase / 220));
  ctx.strokeStyle = `rgba(255, 210, 62, ${alpha})`;
  ctx.lineWidth = 4;
  ctx.setLineDash([10, 8]);
  ctx.beginPath();
  ctx.arc(x, y, 30, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
}
