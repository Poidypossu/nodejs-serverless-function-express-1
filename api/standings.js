const { fetchTeamMetadata } = require("../utils/fetch");
const { getTeamName } = require("../utils/mappings");

module.exports = async (req, res) => {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }
  
  try {
    const season = req.query.season || 2025;
    const data = await fetchTeamMetadata(season);
    
    const standings = (data.teams || [])
      .map(team => {
        const record = team.record?.overall || {};
        const ownerId = team.owners?.[0] || team.primaryOwner;
        const owner = data.members?.find(m => m.id === ownerId);
        
        return {
          rank: team.currentProjectedRank || 0,
          teamId: team.id,
          teamName: getTeamName(team, data.members || []),
          teamAbbrev: team.abbrev || "",
          ownerName: owner?.displayName || "Unknown",
          wins: record.wins || 0,
          losses: record.losses || 0,
          ties: record.ties || 0,
          winPercentage: record.percentage || 0,
          pointsFor: record.pointsFor || 0,
          pointsAgainst: record.pointsAgainst || 0,
          pointDifferential: (record.pointsFor || 0) - (record.pointsAgainst || 0),
          totalPoints: team.points || 0,
          gamesBack: record.gamesBack || 0,
          streak: `${record.streakType || ""} ${record.streakLength || 0}`.trim(),
          waiverRank: team.waiverRank || 0,
          playoffSeed: team.playoffSeed || 0
        };
      })
      .sort((a, b) => {
        // Sort by win percentage (desc), then points for (desc)
        if (b.winPercentage !== a.winPercentage) {
          return b.winPercentage - a.winPercentage;
        }
        return b.pointsFor - a.pointsFor;
      })
      .map((team, index) => ({
        ...team,
        rank: index + 1
      }));
    
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.status(200).json(standings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
