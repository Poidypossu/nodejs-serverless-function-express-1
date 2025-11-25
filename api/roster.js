// rosterTable.js
export default async function handler(req, res) {
  try {
    const season = req.query.season || 2025;
    const leagueId = 169608;

    const url = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${season}/segments/0/leagues/${leagueId}?view=mRoster`;
    const data = await (await fetch(url)).json();

    const teams = {};
    for (const t of data.teams || []) {
      const name = t.name || `${t.location || ""} ${t.nickname || ""}`.trim();
      teams[t.id] = { name, abbrev: t.abbrev || "" };
    }

    const nfl = {
      1:"Falcons",2:"Bills",3:"Bears",4:"Bengals",5:"Browns",6:"Cowboys",
      7:"Broncos",8:"Lions",9:"Packers",10:"Titans",11:"Colts",12:"Chiefs",
      13:"Raiders",14:"Rams",15:"Dolphins",16:"Vikings",17:"Patriots",
      18:"Saints",19:"Giants",20:"Jets",21:"Eagles",22:"Cardinals",
      23:"Steelers",24:"Chargers",25:"49ers",26:"Seahawks",27:"Buccaneers",
      28:"Commanders",29:"Panthers",30:"Jaguars",33:"Ravens",34:"Texans"
    };

    const rows = [];

    for (const t of data.teams || []) {
      for (const e of t.roster.entries || []) {
        const p = e.playerPoolEntry.player;
        rows.push({
          fantasyTeamId: t.id,
          fantasyTeamName: teams[t.id]?.name,
          fantasyTeamAbbrev: teams[t.id]?.abbrev,
          playerId: p.id,
          fullName: p.fullName,
          positionId: p.defaultPositionId,
          nflTeamId: p.proTeamId,
          nflTeamName: nfl[p.proTeamId] || "",
          lineupSlotId: e.lineupSlotId
        });
      }
    }

    res.status(200).json(rows);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
