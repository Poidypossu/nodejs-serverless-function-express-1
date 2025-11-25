export default async function handler(req, res) {
  const { season } = req.query;

  const url = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${season}/segments/0/leagues/169608?view=mStandings`;

  try {
    const espnRes = await fetch(url);
    const data = await espnRes.json();

    // Extract teams with simulation results
    const teams = data.teams.map(t => ({
      teamId: t.id,
      playoffClinchType: t.playoffClinchType,
      rank: t.currentSimulationResults?.rank,
      playoffPct: t.currentSimulationResults?.playoffPct,
      divisionWinPct: t.currentSimulationResults?.divisionWinPct,
      modeRecord: t.currentSimulationResults?.modeRecord || {}
    }));

    // Extract schedule (all matchups)
    const schedule = data.schedule.map(m => ({
      week: m.matchupPeriodId,
      homeTeamId: m.home?.teamId,
      homePoints: m.home?.totalPoints,
      awayTeamId: m.away?.teamId,
      awayPoints: m.away?.totalPoints
    }));

    // Extract league status
    const status = {
      currentMatchupPeriod: data.status?.currentMatchupPeriod,
      latestScoringPeriod: data.status?.latestScoringPeriod,
      finalScoringPeriod: data.status?.finalScoringPeriod,
      firstScoringPeriod: data.status?.firstScoringPeriod,
      isActive: data.status?.isActive,
      isFull: data.status?.isFull,
      previousSeasons: data.status?.previousSeasons || [],
      waiverLastExecutionDate: data.status?.waiverLastExecutionDate,
      waiverProcessStatus: data.status?.waiverProcessStatus || {}
    };

    return res.status(200).json({
      season,
      leagueId: data.id,
      schedule,
      teams,
      status
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
