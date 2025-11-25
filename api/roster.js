const { fetchESPNData, fetchTeamMetadata } = require("../utils/fetch");
const { getTeamName, getNFLTeamName, getPositionName, getLineupSlotName } = require("../utils/mappings");

module.exports = async (req, res) => {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }
  
  try {
    const season = req.query.season || 2025;
    
    // Fetch fresh team metadata for name resolution
    const teamData = await fetchTeamMetadata(season);
    const teamMap = {};
    (teamData.teams || []).forEach(team => {
      teamMap[team.id] = {
        name: getTeamName(team, teamData.members || []),
        abbrev: team.abbrev || ""
      };
    });
    
    // Fetch roster data
    const rosterData = await fetchESPNData(season, "mRoster");
    
    const roster = [];
    (rosterData.teams || []).forEach(team => {
      const teamInfo = teamMap[team.id] || { name: `Team ${team.id}`, abbrev: "" };
      const entries = team.roster?.entries || [];
      
      entries.forEach(entry => {
        const player = entry.playerPoolEntry?.player || {};
        roster.push({
          teamId: team.id,
          teamName: teamInfo.name,
          teamAbbrev: teamInfo.abbrev,
          playerId: player.id || 0,
          playerName: player.fullName || "Unknown",
          playerFirstName: player.firstName || "",
          playerLastName: player.lastName || "",
          position: getPositionName(player.defaultPositionId),
          positionId: player.defaultPositionId || 0,
          lineupSlot: getLineupSlotName(entry.lineupSlotId),
          lineupSlotId: entry.lineupSlotId || 0,
          nflTeam: getNFLTeamName(player.proTeamId),
          nflTeamId: player.proTeamId || 0,
          status: player.status || "",
          acquisitionType: entry.acquisitionType || "UNKNOWN"
        });
      });
    });
    
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.status(200).json(roster);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
