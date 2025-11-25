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
    
    const teams = (data.teams || []).map(team => {
      const record = team.record?.overall || {};
      const ownerId = team.owners?.[0] || team.primaryOwner;
      const owner = data.members?.find(m => m.id === ownerId);
      
      return {
        teamId: team.id,
        teamName: getTeamName(team, data.members || []),
        teamAbbrev: team.abbrev || "",
        ownerName: owner?.displayName || "Unknown",
        ownerFirstName: owner?.firstName || "",
        ownerLastName: owner?.lastName || "",
        wins: record.wins || 0,
        losses: record.losses || 0,
        ties: record.ties || 0,
        winPercentage: record.percentage || 0,
        pointsFor: record.pointsFor || 0,
        pointsAgainst: record.pointsAgainst || 0,
        pointDifferential: (record.pointsFor || 0) - (record.pointsAgainst || 0),
        totalPoints: team.points || 0,
        waiverRank: team.waiverRank || 0,
        playoffSeed: team.playoffSeed || 0,
        currentRank: team.currentProjectedRank || 0,
        streakType: record.streakType || "",
        streakLength: record.streakLength || 0,
        acquisitions: team.transactionCounter?.acquisitions || 0,
        drops: team.transactionCounter?.drops || 0,
        trades: team.transactionCounter?.trades || 0
      };
    });
    
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.status(200).json(teams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
