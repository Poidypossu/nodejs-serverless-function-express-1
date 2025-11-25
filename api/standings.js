export default async function handler(req, res) {
  const { season } = req.query;

  const url = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${season}/segments/0/leagues/169608?view=mStandings`;

  try {
    const espnRes = await fetch(url);
    const data = await espnRes.json();

    const teams = data.teams.map(t => {
      const record = t.record || {};
      const overall = record.overall || {};

      return {
        id: t.id,
        name: `${t.location || ""} ${t.nickname || ""}`.trim(),
        abbrev: t.abbrev,
        owner: t.primaryOwner,
        wins: overall.wins,
        losses: overall.losses,
        ties: overall.ties,
        pointsFor: overall.pointsFor,
        pointsAgainst: overall.pointsAgainst,
        percentage: overall.percentage,
        streakType: overall.streakType,
        streakLength: overall.streakLength,
        homeWins: record.home?.wins,
        awayWins: record.away?.wins,
        divisionWins: record.division?.wins
      };
    });

    return res.status(200).json({
      season,
      leagueId: data.id,
      teams
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
