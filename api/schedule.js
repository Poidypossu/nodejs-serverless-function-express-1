const fetch = require("node-fetch");

module.exports = async function schedule(req, res) {
  const season = req.query.season || 2025;
  const leagueId = 169608;

  const url = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${season}/segments/0/leagues/${leagueId}?view=mStandings`;

  try {
    const raw = await fetch(url);
    const json = await raw.json();

    const teamsById = {};
    json.teams.forEach(t => {
      const name =
        t.name ||
        `${t.location || ""} ${t.nickname || ""}`.trim() ||
        t.abbrev ||
        `Team ${t.id}`;
      teamsById[t.id] = name;
    });

    const rows = json.schedule.map((m, i) => ({
      matchup: i + 1,
      periodId: m.matchupPeriodId,
      awayTeamId: m.away.teamId,
      awayTeamName: teamsById[m.away.teamId],
      awayPoints: m.away.totalPoints,
      homeTeamId: m.home.teamId,
      homeTeamName: teamsById[m.home.teamId],
      homePoints: m.home.totalPoints
    }));

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
