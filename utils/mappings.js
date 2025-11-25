// NFL Team ID to Name Mapping
const NFL_TEAMS = {
  1: { name: "Atlanta Falcons", abbrev: "ATL" },
  2: { name: "Buffalo Bills", abbrev: "BUF" },
  3: { name: "Chicago Bears", abbrev: "CHI" },
  4: { name: "Cincinnati Bengals", abbrev: "CIN" },
  5: { name: "Cleveland Browns", abbrev: "CLE" },
  6: { name: "Dallas Cowboys", abbrev: "DAL" },
  7: { name: "Denver Broncos", abbrev: "DEN" },
  8: { name: "Detroit Lions", abbrev: "DET" },
  9: { name: "Green Bay Packers", abbrev: "GB" },
  10: { name: "Tennessee Titans", abbrev: "TEN" },
  11: { name: "Indianapolis Colts", abbrev: "IND" },
  12: { name: "Kansas City Chiefs", abbrev: "KC" },
  13: { name: "Las Vegas Raiders", abbrev: "LV" },
  14: { name: "Los Angeles Rams", abbrev: "LAR" },
  15: { name: "Miami Dolphins", abbrev: "MIA" },
  16: { name: "Minnesota Vikings", abbrev: "MIN" },
  17: { name: "New England Patriots", abbrev: "NE" },
  18: { name: "New Orleans Saints", abbrev: "NO" },
  19: { name: "New York Giants", abbrev: "NYG" },
  20: { name: "New York Jets", abbrev: "NYJ" },
  21: { name: "Philadelphia Eagles", abbrev: "PHI" },
  22: { name: "Arizona Cardinals", abbrev: "ARI" },
  23: { name: "Pittsburgh Steelers", abbrev: "PIT" },
  24: { name: "Los Angeles Chargers", abbrev: "LAC" },
  25: { name: "San Francisco 49ers", abbrev: "SF" },
  26: { name: "Seattle Seahawks", abbrev: "SEA" },
  27: { name: "Tampa Bay Buccaneers", abbrev: "TB" },
  28: { name: "Washington Commanders", abbrev: "WAS" },
  29: { name: "Carolina Panthers", abbrev: "CAR" },
  30: { name: "Jacksonville Jaguars", abbrev: "JAX" },
  33: { name: "Baltimore Ravens", abbrev: "BAL" },
  34: { name: "Houston Texans", abbrev: "HOU" }
};

// Position ID to Name Mapping
const POSITIONS = {
  1: "QB",
  2: "RB",
  3: "WR",
  4: "TE",
  5: "K",
  16: "DEF"
};

// Lineup Slot ID to Name Mapping
const LINEUP_SLOTS = {
  0: "QB",
  2: "RB",
  4: "WR",
  6: "TE",
  16: "K",
  17: "DEF",
  20: "Bench",
  21: "IR",
  23: "FLEX",
  24: "OP"
};

function getNFLTeamName(proTeamId) {
  return NFL_TEAMS[proTeamId]?.name || `Team ${proTeamId}`;
}

function getNFLTeamAbbrev(proTeamId) {
  return NFL_TEAMS[proTeamId]?.abbrev || `T${proTeamId}`;
}

function getPositionName(positionId) {
  return POSITIONS[positionId] || `Pos${positionId}`;
}

function getLineupSlotName(slotId) {
  return LINEUP_SLOTS[slotId] || `Slot${slotId}`;
}

function getTeamName(team, members) {
  if (team.name) return team.name;
  const location = team.location || "";
  const nickname = team.nickname || "";
  if (location || nickname) {
    return `${location} ${nickname}`.trim();
  }
  const ownerId = team.owners?.[0] || team.primaryOwner;
  const owner = members.find(m => m.id === ownerId);
  return owner?.displayName || `Team ${team.id}`;
}

module.exports = {
  getNFLTeamName,
  getNFLTeamAbbrev,
  getPositionName,
  getLineupSlotName,
  getTeamName
};

