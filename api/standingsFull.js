// standingsFull.js
export default async function handler(req, res) {
  try {
    const season = req.query.season || 2025;
    const leagueId = 169608;

    const url = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${season}/segments/0/leagues/${leagueId}?view=mStandings`;
    const data = await (await fetch(url)).json();

    const teamLookup = {};
    const standings = (data.teams || []).map(t => {
      const name = t.name || `${t.location || ""} ${t.nickname || ""}`.trim();
      teamLookup[t.id] = { name, abbrev: t.abbrev || "" };

      const r = t.currentSimulationResults?.modeRecord || {};
      return {
        teamId: t.id,
        teamName: name,
        abbrev: t.abbrev || "",
        rank: t.currentSimulationResults?.rank,
        playoffClinchType: t.playoffClinchType,
        playoffPct: t.currentSimulationResults?.playoffPct,
        divisionWinPct: t.currentSimulationResults?.divisionWinPct,
        wins: r.wins,
        losses: r.losses,
        ties: r.ties
      };
    });

    const schedule = (data.schedule || []).map((m, i) => {
      const a = m.away || {};
      const h = m.home || {};
      return {
        matchupIndex: i + 1,
        periodId: m.matchupPeriodId,
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

    res.status(200).json({ standings, schedule });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
