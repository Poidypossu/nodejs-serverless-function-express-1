# Custom GPT for ESPN Fantasy Football Leagues

This project exposes a set of **read‑only JSON endpoints** for an ESPN Fantasy Football league (league ID `169608`) and is designed to be used by a **Custom GPT** via Actions. It runs on **Vercel** as Node.js serverless functions.

You can adapt it to your own league by changing the league ID in `utils/fetch.js` and redeploying.

---

## Endpoints

All endpoints are available under your Vercel base URL, for example:

```text
https://nodejs-serverless-function-express-coral-mu-68.vercel.app
```

### `GET /api/teams`
Returns one row per fantasy team for a season.

- **Query params**
  - `season` (optional, integer) – season year; defaults to current year.
- **Fields (high level)**
  - Team id, name, abbrev.
  - Owner display name / name fields.
  - Wins, losses, ties, win percentage.
  - Points for, points against, point differential.
  - Waiver rank, playoff seed, streak, etc.

### `GET /api/roster`
Returns one row per rostered player.

- **Query params**
  - `season` (optional, integer)
- **Fields (high level)**
  - Fantasy team id + abbrev.
  - Player id, full/first/last name.
  - Position + NFL team.
  - Lineup slot (starter, bench, IR, etc.).
  - Acquisition type and player status.

### `GET /api/schedule`
Returns one row per matchup.

- **Query params**
  - `season` (optional, integer)
- **Fields (high level)**
  - Week.
  - Away/home team ids, names, points.
  - Winner label.

### `GET /api/standings`
Standings table for a season, sorted by win percentage and then points for.

- **Query params**
  - `season` (optional, integer)

### `GET /api/standingsFull`
Combined payload with both teams and schedule.

- **Query params**
  - `season` (optional, integer)
- **Response**
  - `{ teams: [...], schedule: [...] }`

### `GET /api/history`
Historical team‑game data across multiple seasons. Each row represents one team in one game.

- **Query params**
  - `years` (optional, integer) – how many seasons back to fetch (default: `5`, i.e. current year down to current‑5).
- **Fields (short names to keep payload small)**
  - `s` – season.
  - `w` – week.
  - `mid` – matchup id (index within season).
  - `tid` – team id.
  - `ta` – team abbrev.
  - `otid` – opponent team id.
  - `ota` – opponent team abbrev.
  - `pf` – points for.
  - `pa` – points against.
  - `diff` – point differential (rounded to 0.1).

Useful for questions like:

- Biggest blowouts over a time span.
- Average points scored/allowed by a team.
- “Which team allows the most points?”

### `GET /api/kona`
All players in the ESPN player catalog (rostered + free agents), cleaned up for GPT use.

- **Query params**
  - `season` (optional, integer)
- **Fields (high level)**
  - Player id, full/first/last name.
  - Position + position id.
  - NFL team (name + abbrev).
  - Injury status, active flag.
  - `rosterStatus` – `"ROSTERED"` or `"FREE_AGENT"`.
  - If rostered, fantasy team name/abbrev.

This endpoint uses the `kona_player_info` view with the required `x-fantasy-filter` header; that logic is handled inside `utils/fetch.js`.

---

## Implementation Notes

- League ID and ESPN base URL live in `utils/fetch.js`:

  ```js
  const LEAGUE_ID = 169608; // change this to your league id
  const BASE_URL = "https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons";
  ```

- `utils/mappings.js` contains helpers to map:
  - ESPN `proTeamId` → NFL team name/abbrev.
  - Position ids → `QB`, `RB`, `WR`, etc.
  - Lineup slot ids → `QB`, `RB`, `WR`, `Bench`, `IR`, etc.
  - A fantasy team + members → best human‑readable team name.

- Each file in `api/` is a Vercel serverless function. For example, `api/teams.js` handles `/api/teams`.

- `api/hello.ts` is an Express app used as a convenience router locally; Vercel still uses the individual JS files in `api/` for the deployed endpoints.

---

## Deploying

1. Push this repository to GitHub.
2. In Vercel, click **New Project → Import Git Repository** and select this repo.
3. Use the default settings; Vercel will detect Node.js and the `api/` folder automatically.
4. Once deployed, note the base URL (e.g. `https://your-project-name.vercel.app`) and append the endpoint paths from above.

`vercel.json` is intentionally minimal:

```json
{
  "version": 2,
  "buildCommand": null
}
```

This tells Vercel to treat the project as API‑only with no static build output.

---

## Using with a Custom GPT

You can define Actions in a Custom GPT by providing an OpenAPI schema that points at these endpoints (for example, wiring `/api/history` and `/api/kona` so the GPT can answer multi‑year and free‑agent questions). See your local `chatgptinstruction.md` or `reddit_guide.md` for example instructions and schema snippets.


