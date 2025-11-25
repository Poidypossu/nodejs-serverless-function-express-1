import fetch from 'node-fetch';

export default async function handler(req, res) {
  const season = req.query.season || 2025;
  const leagueId = 169608;

  const teamsURL = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${season}/segments/0/leagues/${leagueId}?view=mTeam`;
  const standingsURL = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${season}/segments/0/leagues/${leagueId}?view=mStandings`;

  try {
    // 1. Fetch team metadata
    const teamsRes = await fetch(teamsURL);
    const teamsJson = await teamsRes.json();

    const teamMap = {};
    for (const t of teamsJson.teams) {
      teamMap[t.id] = {
        teamName: t.name || `${t.location} ${t.nickname}`.trim(),
        abbrev: t.abbrev,
        owner: (t.owners && t.owners.length > 0) ? t.owners[0] : null
      };
    }

    // 2. Fetch standings
    const stdRes = await fetch(standingsURL);
    const standings = await stdRes.json();

    // 3. Replace IDs with names
    const enrichedTeams = standings.teams.map(t => ({
      teamId: t.id,
      teamName: teamMap[t.id]?.teamName,
      abbrev: teamMap[t.id]?.abbrev,
      owner: teamMap[t.id]?.owner,
      rank: t.currentSimulationResults?.rank,
      playoffClinchType: t.playoffClinchType,
      playoffPct: t.currentSimulationResults?.playoffPct,
      divisionWinPct: t.currentSimulationResults?.divisionWinPct,
      record: t.currentSimulationResults?.modeRecord
    }));

    const enrichedSchedule = standings.schedule.map((m, idx) => ({
      matchup: idx + 1,
      periodId: m.matchupPeriodId,
      away: {
        teamId: m.away.teamId,
        teamName: teamMap[m.away.teamId]?.teamName,
        abbrev: teamMap[m.away.teamId]?.abbrev,
        points: m.away.totalPoints
      },
      home: {
        teamId: m.home.teamId,
        teamName: teamMap[m.home.teamId]?.teamName,
        abbrev: teamMap[m.home.teamId]?.abbrev,
        points: m.home.totalPoints
      }
    }));

    res.status(200).json({
      season,
      leagueId,
      teams: enrichedTeams,
      schedule: enrichedSchedule
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
