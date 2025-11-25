// standings.js
export default async function handler(req, res) {
  try {
    const season = req.query.season || 2025;
    const leagueId = 169608;

    const url = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${season}/segments/0/leagues/${leagueId}?view=mStandings`;
    const data = await (await fetch(url)).json();

    const rows = (data.teams || []).map(t => {
      const record = t.currentSimulationResults?.modeRecord || {};
      const name = t.name || `${t.location || ""} ${t.nickname || ""}`.trim();

      return {
        teamId: t.id,
        teamName: name,
        abbrev: t.abbrev || "",
        rank: t.currentSimulationResults?.rank || null,
        playoffClinchType: t.playoffClinchType || "",
        playoffPct: t.currentSimulationResults?.playoffPct || 0,
        divisionWinPct: t.currentSimulationResults?.divisionWinPct || 0,
        wins: record.wins,
        losses: record.losses,
        ties: record.ties,
        pointsFor: record.pointsFor,
        pointsAgainst: record.pointsAgainst,
        streakType: record.streakType,
        streakLength: record.streakLength
      };
    });

    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
