const fetch = require("node-fetch");

module.exports = async function roster(req, res) {
  const season = req.query.season || 2025;
  const leagueId = 169608;

  const urlRoster = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${season}/segments/0/leagues/${leagueId}?view=mRoster`;
  const urlTeams = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${season}/segments/0/leagues/${leagueId}`;

  try {
    // Pull team metadata first so ID → Name works
    const teamsRes = await fetch(urlTeams);
    const teamsJson = await teamsRes.json();

    const teamLookup = {};
    for (const t of teamsJson.teams) {
      teamLookup[t.id] =
        t.name ||
        `${t.location || ""} ${t.nickname || ""}`.trim() ||
        t.abbrev ||
        `Team ${t.id}`;
    }

    // NFL team mapping
    const proTeamMap = {
      1: "Falcons",
      2: "Bills",
      3: "Bears",
      4: "Bengals",
      5: "Browns",
      6: "Cowboys",
      7: "Broncos",
      8: "Lions",
      9: "Packers",
      10: "Titans",
      11: "Colts",
      12: "Chiefs",
      13: "Raiders",
      14: "Rams",
      15: "Dolphins",
      16: "Vikings",
      17: "Patriots",
      18: "Saints",
      19: "Giants",
      20: "Jets",
      21: "Eagles",
      22: "Cardinals",
      23: "Steelers",
      24: "Chargers",
      25: "49ers",
      26: "Seahawks",
      27: "Buccaneers",
      28: "Commanders",
      29: "Panthers",
      30: "Jaguars",
      33: "Ravens",
      34: "Texans"
    };

    // Pull roster data
    const rosterRes = await fetch(urlRoster);
    const json = await rosterRes.json();

    const rows = [];

    for (const team of json.teams) {
      const fantasyTeamName = teamLookup[team.id];
      const roster = team.roster?.entries || [];

      for (const e of roster) {
        const p = e.playerPoolEntry.player;

        rows.push({
          fantasyTeamId: team.id,
          fantasyTeamName,
          lineupSlotId: e.lineupSlotId,
          playerId: p.id,
          playerName: p.fullName,
          positionId: p.defaultPositionId,
          position: p.defaultPositionId,
          nflTeamId: p.proTeamId,
          nflTeam: proTeamMap[p.proTeamId] || null,
          injuryStatus: p.injuryStatus || null,
          acquisitionType: e.acquisitionType || null
        });
      }
    }

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
