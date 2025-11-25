import fetch from 'node-fetch';

export default async function handler(req, res) {
  const season = req.query.season || 2025;
  const leagueId = 169608;

  const base = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${season}/segments/0/leagues/${leagueId}`;

  const teamURL = `${base}?view=mTeam`;
  const standingsURL = `${base}?view=mStandings`;

  try {
    // 1. Fetch team metadata
    const teamRes = await fetch(teamURL);
    const teamJson = await teamRes.json();

    // Build a map of teamId -> metadata
    const teamMap = {};
    for (const t of teamJson.teams) {
      teamMap[t.id] = {
        teamName: t.name || `${t.location} ${t.nickname}`.trim(),
        abbrev: t.abbrev,
        ownerDisplay:
          (teamJson.members?.find(m => m.id === t.owners?.[0])?.displayName) ||
          t.owners?.[0] ||
          "Unknown Owner"
      };
    }

    // 2. Fetch standings
    const stdRes = await fetch(standingsURL);
    const standings = await stdRes.json();

    // 3. Build clean team standings
    const teams = standings.teams.map(t => ({
      teamId: t.id,
      teamName: teamMap[t.id].teamName,
      abbrev: teamMap[t.id].abbrev,
      owner: teamMap[t.id].ownerDisplay,
      rank: t.currentSimulationResults?.rank,
      record: {
        wins: t.currentSimulationResults?.modeRecord?.wins,
        losses: t.currentSimulationResults?.modeRecord?.losses,
        ties: t.currentSimulationResults?.modeRecord?.ties,
        streakType: t.currentSimulationResults?.modeRecord?.streakType,
        streakLength: t.currentSimulationResults?.modeRecord?.streakLength
      },
      playoff: {
        clinch: t.playoffClinchType,
        pct: t.currentSimulationResults?.playoffPct
      },
      division: {
        winPct: t.currentSimulationResults?.divisionWinPct
      }
    }));

    // 4. Build clean schedule
    const schedule = standings.schedule.map((m, i) => ({
      matchup: i + 1,
      period: m.matchupPeriodId,
      away: {
        teamId: m.away.teamId,
        teamName: teamMap[m.away.teamId].teamName,
        abbrev: teamMap[m.away.teamId].abbrev,
        points: m.away.totalPoints
      },
      home: {
        teamId: m.home.teamId,
        teamName: teamMap[m.home.teamId].teamName,
        abbrev: teamMap[m.home.teamId].abbrev,
        points: m.home.totalPoints
      }
    }));

    res.status(200).json({
      season,
      leagueId,
      teams,
      schedule
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
