export default async function handler(req, res) {
  const { season } = req.query;

  const standingsUrl = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${season}/segments/0/leagues/169608?view=mStandings`;
  const rosterUrl =     `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${season}/segments/0/leagues/169608?view=mRoster`;

  try {
    // Fetch both endpoints in parallel
    const [standRes, rosterRes] = await Promise.all([
      fetch(standingsUrl),
      fetch(rosterUrl)
    ]);

    const standingsData = await standRes.json();
    const rosterData = await rosterRes.json();

    // Build team metadata map from mRoster
    const metaMap = {};
    for (const t of rosterData.teams) {
      metaMap[t.id] = {
        name: `${t.location} ${t.nickname}`.trim(),
        abbrev: t.abbrev,
        owner: t.primaryOwner
      };
    }

    // Combine standings + metadata
    const teams = standingsData.teams.map(t => {
      const meta = metaMap[t.id] || {};

      // Safely handle missing record data (preseason or early week 1)
      const rec = t.record?.overall || {
        wins: 0,
        losses: 0,
        ties: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        streakLength: 0,
        streakType: "NONE"
      };

      return {
        id: t.id,
        name: meta.name ?? "",
        abbrev: meta.abbrev ?? "",
        owner: meta.owner ?? "",

        wins: rec.wins,
        losses: rec.losses,
        ties: rec.ties,

        pointsFor: rec.pointsFor,
        pointsAgainst: rec.pointsAgainst,

        streakLength: rec.streakLength,
        streakType: rec.streakType,

        playoffClinchType: t.playoffClinchType,
        simulationRank: t.currentSimulationResults?.rank
      };
    });

    return res.status(200).json({
      season,
      leagueId: standingsData.id,
      teams
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
