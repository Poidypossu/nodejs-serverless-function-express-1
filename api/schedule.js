// schedule.js
export default async function handler(req, res) {
  try {
    const season = req.query.season || 2025;
    const leagueId = 169608;

    const url = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${season}/segments/0/leagues/${leagueId}?view=mStandings`;
    const data = await (await fetch(url)).json();

    const teamLookup = {};
    for (const t of data.teams || []) {
      const name = t.name || `${t.location || ""} ${t.nickname || ""}`.trim();
      teamLookup[t.id] = { name, abbrev: t.abbrev || "" };
    }

    const rows = (data.schedule || []).map((m, i) => {
      const a = m.away || {};
      const h = m.home || {};
      return {
        matchupIndex: i + 1,
        matchupPeriodId: m.matchupPeriodId,
        awayTeamId: a.teamId,
        awayTeamName: teamLookup[a.teamId]?.name || "",
        awayAbbrev: teamLookup[a.teamId]?.abbrev || "",
        awayPoints: a.totalPoints,
        homeTeamId: h.teamId,
        homeTeamName: teamLookup[h.teamId]?.name || "",
        homeAbbrev: teamLookup[h.teamId]?.abbrev || "",
        homePoints: h.totalPoints
      };
    });

    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
