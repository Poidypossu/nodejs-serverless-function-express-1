const fetch = require("node-fetch");

module.exports = async function roster(req, res) {
  const season = req.query.season || 2025;
  const leagueId = 169608;

  const urlTeams = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${season}/segments/0/leagues/${leagueId}?view=mTeam`;
  const urlRoster = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${season}/segments/0/leagues/${leagueId}?view=mRoster`;

  try {
    const [teamsRaw, rosterRaw] = await Promise.all([fetch(urlTeams), fetch(urlRoster)]);

    const teamsJson = await teamsRaw.json();
    const rosterJson = await rosterRaw.json();

    const teamsById = {};
    teamsJson.teams.forEach(t => {
      const name =
        t.name ||
        `${t.location || ""} ${t.nickname || ""}`.trim() ||
        t.abbrev ||
        `Team ${t.id}`;
      teamsById[t.id] = name;
    });

    const rows = [];

    rosterJson.teams.forEach(team => {
      const teamName = teamsById[team.id];
      const entries = team.roster?.entries || [];

      entries.forEach(e => {
        const p = e.playerPoolEntry?.player || {};
        rows.push({
          teamId: team.id,
          teamName,
          playerId: p.id,
          playerName: p.fullName,
          positionId: p.defaultPositionId,
          nflTeamId: p.proTeamId,
          lineupSlotId: e.lineupSlotId
        });
      });
    });

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
