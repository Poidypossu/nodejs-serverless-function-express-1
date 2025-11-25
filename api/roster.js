export default async function handler(req, res) {
  const { season = 2025 } = req.query;

  const url = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${season}/segments/0/leagues/169608?view=mRoster`;

  try {
    const espnRes = await fetch(url);
    const data = await espnRes.json();

    // Reduce roster payload massively
    const teams = data.teams.map(team => ({
      id: team.id,
      name: team.name || `${team.location} ${team.nickname}`.trim(),
      roster: team.roster.entries.map(e => ({
        playerId: e.playerId,
        fullName: e.playerPoolEntry.player.fullName,
        defaultPositionId: e.playerPoolEntry.player.defaultPositionId,
        proTeamId: e.playerPoolEntry.player.proTeamId,
        lineupSlotId: e.lineupSlotId
      }))
    }));

    return res.status(200).json({ season, leagueId: 169608, teams });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
