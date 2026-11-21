// Round and game configuration for Lantern Harbor.
// One entry per round: name, scene size, time limit, hint count, palette.
export const SCENE_WIDTH = 560;
export const SCENE_HEIGHT = 420;
export const HIT_RADIUS = 30;

export const ROUNDS = [
  {
    id: 'harbor',
    name: 'Lantern Harbor at Dusk',
    subtitle: 'Round 1 of 3 — find 7 differences',
    timeLimit: 120,
    hints: 3,
    skyTop: '#2b2a55',
    skyMid: '#7a4a7d',
    skyLow: '#e8805a',
    water: '#274b63',
    waterDeep: '#16303f',
  },
  {
    id: 'market',
    name: 'Night Market',
    subtitle: 'Round 2 of 3 — find 9 differences',
    timeLimit: 120,
    hints: 3,
    skyTop: '#101a3a',
    skyMid: '#233a6b',
    skyLow: '#3d5a8a',
    water: '#1d2f4d',
    waterDeep: '#101f33',
  },
  {
    id: 'garden',
    name: 'Garden Morning',
    subtitle: 'Round 3 of 3 — find 12 differences',
    timeLimit: 150,
    hints: 3,
    skyTop: '#7ec8e3',
    skyMid: '#bfe6f2',
    skyLow: '#fdf0c0',
    water: '#5fae7a',
    waterDeep: '#3d8a58',
  },
];

export const SCORE_FIND = 100;
export const SCORE_WRONG = -10;
export const TIME_PENALTY = 5;
export const TIME_BONUS_PER_SECOND = 5;
