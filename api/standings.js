export default async function handler(req, res) {
  const { season = 2025 } = req.query;

  const standingsUrl = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${season}/segments/0/leagues/169608?view=mStandings`;
  const teamUrl      = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${season}/segments/0/leagues/169608?view=mTeam`;

  try {
    const [standRes, teamRes] = await Promise.all([
      fetch(standingsUrl),
      fetch(teamUrl)
    ]);

    const standingsData = await standRes.json();
    const teamData      = await teamRes.json();

    // Owner name lookup
    const memberNames = {};
    for (const m of teamData.members) {
      memberNames[m.id] = m.displayName;
    }

    // Team metadata lookup (id → info)
    const teamLookup = {};
    for (const t of teamData.teams) {
      const ownerId = t.owners?.[0];
      const ownerName = memberNames[ownerId] || "Unknown Owner";

      const resolvedName =
        t.name ||
        `${t.location || ""} ${t.nickname || ""}`.trim() ||
        ownerName;

      teamLookup[t.id] = {
        id: t.id,
        name: resolvedName,
        abbrev: t.abbrev,
        owner: ownerName
      };
    }

    // Now extract standings table
    const teams = standingsData.teams.map(t => {
      const meta = teamLookup[t.id];

      const rec = t.record.overall;

      return {
        id: t.id,
        name: meta.name,
        abbrev: meta.abbrev,
        owner: meta.owner,

        // Record
        wins: rec.wins,
        losses: rec.losses,
        ties: rec.ties,
        winPct: rec.percentage,
        pointsFor: rec.pointsFor,
        pointsAgainst: rec.pointsAgainst,
        gamesBack: rec.gamesBack,

        // Streak
        streakType: rec.streakType,   // WIN or LOSS
        streakLength: rec.streakLength,

        // Rankings
        finalRank: t.rankFinal ?? null,
        playoffSeed: t.playoffSeed ?? null
      };
    });

    // Sort by best win % → pointsFor as tiebreaker
    teams.sort((a, b) => {
      if (b.winPct !== a.winPct) return b.winPct - a.winPct;
      return b.pointsFor - a.pointsFor;
    });

    return res.status(200).json({
      season,
      leagueId: 169608,
      standings: teams
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
