const LEAGUE_ID = 696688137;
const BASE_URL = "https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons";

async function fetchESPNData(season, view) {
  const url = `${BASE_URL}/${season}/segments/0/leagues/${LEAGUE_ID}?view=${view}`;
  const headers = {};
  
  if (view === "kona_player_info") {
    headers["x-fantasy-filter"] = JSON.stringify({
      players: {
        limit: 1500,
        sortDraftRanks: {
          sortPriority: 100,
          sortAsc: true,
          value: "STANDARD"
        }
      }
    });
  }
  
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`ESPN API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function fetchTeamMetadata(season = 2025) {
  return fetchESPNData(season, "mTeam");
}

module.exports = {
  fetchESPNData,
  fetchTeamMetadata
};

