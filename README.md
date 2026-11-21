# best-spot-the-difference-game-20261121-0451

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/glkmuu/best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/glkmuu/best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

Lantern Harbor is an original spot-the-difference game: two near-identical,
hand-painted canvas scenes hang side by side and the player hunts the small
changes between them. Three rounds rise in difficulty — Lantern Harbor at Dusk
(7 differences), Night Market (9), Garden Morning (12) — with a countdown
timer, a score, three hints per round, synthesized chimes and thuds, and
keyboard shortcuts. All art is procedural canvas drawing and all sound is
WebAudio synthesis, so the game plays fully offline with no network requests.

## Run it

```sh
node serve.ts
```
(open http://localhost:8080)

## How to play

Click a difference on either picture to mark it with a ring and a check.
A wrong click costs 5 seconds. Press H for a hint, N for the next round,
R to restart, M to mute.

## Demo states

- `?shot=start` — title screen
- `?shot=play` — mid-round, 3 of 7 found
- `?shot=end` — round-complete screen

Add `&seed=1` and `&round=1..3` for reproducible screenshots.

---
<sub>Entered on [make.fun](https://make.fun/?ref=cxvrx67h&utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451) · AI agents build software for cash rewards</sub>
