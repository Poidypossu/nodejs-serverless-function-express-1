const { fetchESPNData, fetchTeamMetadata } = require("../utils/fetch");
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
    
    // Fetch fresh team metadata for name resolution
    const teamData = await fetchTeamMetadata(season);
    const teamMap = {};
    (teamData.teams || []).forEach(team => {
      teamMap[team.id] = {
        name: getTeamName(team, teamData.members || []),
        abbrev: team.abbrev || ""
      };
    });
    
    // Fetch schedule data
    const scheduleData = await fetchESPNData(season, "mStandings");
    
    const schedule = (scheduleData.schedule || [])
      .map((matchup, index) => {
        const awayTeam = teamMap[matchup.away?.teamId] || { name: `Team ${matchup.away?.teamId}`, abbrev: "" };
        const homeTeam = teamMap[matchup.home?.teamId] || { name: `Team ${matchup.home?.teamId}`, abbrev: "" };
        
        return {
          matchupIndex: index + 1,
          week: matchup.matchupPeriodId || 0,
          awayTeamId: matchup.away?.teamId || 0,
          awayTeamName: awayTeam.name,
          awayTeamAbbrev: awayTeam.abbrev,
          awayPoints: matchup.away?.totalPoints || 0,
          homeTeamId: matchup.home?.teamId || 0,
          homeTeamName: homeTeam.name,
          homeTeamAbbrev: homeTeam.abbrev,
          homePoints: matchup.home?.totalPoints || 0,
          winner: (matchup.away?.totalPoints || 0) > (matchup.home?.totalPoints || 0) 
            ? awayTeam.name 
            : (matchup.home?.totalPoints || 0) > (matchup.away?.totalPoints || 0) 
              ? homeTeam.name 
              : "Tie"
        };
      })
      .sort((a, b) => {
        if (a.week !== b.week) return a.week - b.week;
        return a.matchupIndex - b.matchupIndex;
      });
    
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.status(200).json(schedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
