const ErrorResponse = require('./errorResponse');
const {
  nearestPowerOf2Downward,
  subtractAndCalculateTeams,
  courtShuffler,
  getRandomCourt,
} = require('./mixFunction');

exports.seedTeamsForRound = (teams) => {
  const shuffledTeams = shuffleArray(teams); // Shuffle the teams randomly
  const matches = [];
  const numberOfMatches = shuffledTeams.length / 2;
  for (let i = 0; i < numberOfMatches; i++) {
    const teamA = shuffledTeams[i * 2];
    const teamB = shuffledTeams[i * 2 + 1];
    const match = {
      teamA,
      teamB,
    };
    matches.push(match);
  }
  return matches;
};
// Helper function to shuffle an array randomly
const shuffleArray = (array) => {
  const shuffledArray = array.slice();
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
};
exports.generateRoundRobin = (teams, tournamentId, date) => {
  const numberOfTeams = teams.length;
  const matches = [];
  // Calculate the number of rounds required
  const numberOfRounds = numberOfTeams - 1;
  // Create a copy of the teams array to work with
  const teamsCopy = [...teams];
  // Add a bye if the number of teams is odd
  if (numberOfTeams % 2 !== 0) {
    teamsCopy.push('BYE');
  }
  // Generate the matches for each round
  for (let round = 1; round <= numberOfRounds; round++) {
    const roundMatches = [];
    for (let i = 0; i < numberOfTeams / 2; i++) {
      const team1 = teamsCopy[i];
      const team2 = teamsCopy[numberOfTeams - 1 - i];
      if (team1 !== 'BYE' && team2 !== 'BYE') {
        const match = {
          teamA: team1,
          teamB: team2,
          type: "winner's bracket",
          tournamentId: tournamentId,
          date: round == 1 ? date : null,
          round,
          winner: null,
          loser: null,
        };
        roundMatches.push(match);
      }
    }
    // Rotate the teams in the array for the next round
    teamsCopy.splice(1, 0, teamsCopy.pop());
    matches.push(roundMatches);
  }
  return matches;
};

exports.generateSingleBracket = (teamsNames, tournamentId, date) => {
  const teams = shuffleArray(teamsNames);
  const numTeams = teams.length;

  if (numTeams & (numTeams - 1)) {
    throw new Error('Number of teams must be a power of 2.');
  }

  const numRounds = Math.ceil(Math.log2(numTeams));
  let numMatches = 2 ** (numRounds - 1);
  const bracket = [];

  let teamIndex = 0;
  for (let i = 0; i < numRounds; i++) {
    const round = [];

    for (let j = 0; j < numMatches; j++) {
      const teamA = teamIndex < numTeams ? teams[teamIndex++] : null;
      const teamB = teamIndex < numTeams ? teams[teamIndex++] : null;

      round.push({
        teamA,
        teamB,
        type: "winner's bracket",
        tournamentId: tournamentId,
        date: round == 1 ? date : null,
        round: i,
        winner: null,
        loser: null,
      });
    }

    bracket.push(round);
    numMatches /= 2;
  }

  return bracket;
};

exports.generateDoubleEliminationBracket = (teamsNames, tournamentId, date) => {
  const teams = shuffleArray(teamsNames);
  const numTeams = teams.length;

  if (numTeams & (numTeams - 1)) {
    throw new Error('Number of teams must be a power of 2.');
  }
  const numRounds = Math.ceil(Math.log2(numTeams));
  let numMatches = 2 ** (numRounds - 1);
  const winnerBracket = [];
  const loserBracket = [];

  let teamIndex = 0;

  // Generate the winner's bracket
  for (let i = 0; i < numRounds + 1; i++) {
    const round = [];

    for (let j = 0; j < numMatches; j++) {
      const match = {
        teamA: null,
        teamB: null,
        round: i,
        date: round == 1 ? date : null,
        tournamentId: tournamentId,
        type: "winner's bracket",
        winner: null,
        loser: null,
      };

      if (i === 0) {
        // Fill in teams from the provided list
        match.teamA = teams[teamIndex++];
        match.teamB = teams[teamIndex++];
      }

      round.push(match);
    }

    winnerBracket.push(round);
    numMatches /= 2;
  }

  // Generate the loser's bracket
  const numLoserRounds = numRounds - 1;
  let numLoserMatches = 2 ** (numLoserRounds - 1);

  for (let i = 0; i < numLoserRounds; i++) {
    const round = [];

    for (let j = 0; j < numLoserMatches; j++) {
      const match = {
        teamA: null,
        teamB: null,
        round: i,

        tournamentId: tournamentId,
        type: "loser's bracket",
        winner: null,
        loser: null,
      };

      round.push(match);
    }

    loserBracket.push(round);
    numLoserMatches /= 2;
    break;
  }

  return { winnerBracket, loserBracket };
};

exports.generateSingleBracketV2 = (teamsNames, tournamentId, date, court) => {
  const powerN = nearestPowerOf2Downward(teamsNames.length);
  const diffTeam = teamsNames.length - powerN;

  const teams = shuffleArray(teamsNames);
  const flTeam = subtractAndCalculateTeams(teams, diffTeam * 2, powerN);
  const numTeams = flTeam.totalTeams.length;
  const courtArray = courtShuffler(court);
  if (numTeams & (numTeams - 1)) {
    throw new Error('Number of teams must be a power of 2.');
  }

  const numRounds = Math.ceil(Math.log2(numTeams));
  let numMatches = 2 ** (numRounds - 1);
  const bracket = [];

  let teamIndex = 0;
  let diffIndex = 0;
  if (diffTeam != 0) {
    const diffRound = [];
    for (let j = 0; j < diffTeam; j++) {
      const teamA =
        diffIndex < flTeam.subtractedTeams.length ? flTeam.subtractedTeams[diffIndex++] : null;
      const teamB =
        diffIndex < flTeam.subtractedTeams.length ? flTeam.subtractedTeams[diffIndex++] : null;
      diffRound.push({
        teamA,
        teamB,
        type: "winner's bracket",
        court: getRandomCourt(courtArray),
        tournamentId: tournamentId,
        date: 0 ? date : null,
        round: 0,
        winner: null,
        loser: null,
      });
    }
    bracket.push(diffRound);
  }
  for (let i = 0; i < numRounds; i++) {
    const round = [];
    for (let j = 0; j < numMatches; j++) {
      const teamA = teamIndex < numTeams ? flTeam.totalTeams[teamIndex++] : null;
      const teamB = teamIndex < numTeams ? flTeam.totalTeams[teamIndex++] : null;
      let difRnd = diffTeam === 0 ? 0 : 1;
      let rnd = i + difRnd;
      round.push({
        teamA,
        teamB,
        type: "winner's bracket",
        court: getRandomCourt(courtArray),
        tournamentId: tournamentId,
        date: round == 1 ? date : null,
        round: rnd,
        winner: null,
        loser: null,
      });
    }

    bracket.push(round);
    numMatches /= 2;
  }

  return bracket;
};

exports.generateDoubleEliminationBracketV2 = (teamsNames, tournamentId, date, court) => {
  const powerN = nearestPowerOf2Downward(teamsNames.length);
  const diffTeam = teamsNames.length - powerN;

  const teams = shuffleArray(teamsNames);
  const flTeam = subtractAndCalculateTeams(teams, diffTeam * 2, powerN);
  const numTeams = flTeam.totalTeams.length;
  const courtArray = courtShuffler(court);
  if (numTeams & (numTeams - 1)) {
    throw new Error('Number of teams must be a power of 2.');
  }

  const numRounds = Math.ceil(Math.log2(numTeams));
  let numMatches = 2 ** (numRounds - 1);
  const winnerBracket = [];
  let totalMatches = 0;
  let teamIndex = 0;
  let diffIndex = 0;
  if (diffTeam != 0) {
    const diffRound = [];
    for (let j = 0; j < diffTeam; j++) {
      totalMatches++;
      const teamA =
        diffIndex < flTeam.subtractedTeams.length ? flTeam.subtractedTeams[diffIndex++] : null;
      const teamB =
        diffIndex < flTeam.subtractedTeams.length ? flTeam.subtractedTeams[diffIndex++] : null;
      diffRound.push({
        teamA,
        teamB,
        type: "winner's bracket",
        court: getRandomCourt(courtArray),
        tournamentId: tournamentId,
        date: 0 ? date : null,
        round: 0,
        winner: null,
        loser: null,
      });
    }
    winnerBracket.push(diffRound);
  }
  // Generate the winner's bracket
  for (let i = 0; i < numRounds + 1; i++) {
    const round = [];

    for (let j = 0; j < numMatches; j++) {
      totalMatches++;
      let difRnd = diffTeam === 0 ? 0 : 1;
      let rnd = i + difRnd;
      const match = {
        teamA: null,
        teamB: null,
        type: "winner's bracket",
        court: getRandomCourt(courtArray),
        tournamentId: tournamentId,
        date: round == 1 ? date : null,
        round: rnd,
        winner: null,
        loser: null,
      };

      if (i === 0) {
        // Fill in teams from the provided list
        match.teamA = flTeam.totalTeams[teamIndex++];
        match.teamB = flTeam.totalTeams[teamIndex++];
      }

      round.push(match);
    }

    winnerBracket.push(round);
    numMatches /= 2;
  }

  console.log(totalMatches, '-----');
  let loserBracket = loserBracketGenerator(totalMatches - 2, tournamentId, courtArray);
  console.log(loserBracket);
  return { winnerBracket, loserBracket };
};

exports.generateRoundRobinV2 = (players, tournamentId, date, court) => {
  if (players.length % 2 !== 0) {
    players.push(null); // Add a dummy player if the number of players is odd
  }
  const numPlayers = players.length;
  const matches = [];
  const courtArray = courtShuffler(court);
  // Create a circular array to track the order of players
  const playerOrder = [...players];

  for (let round = 1; round < numPlayers; round++) {
    const currentRoundMatches = [];

    for (let i = 0; i < numPlayers / 2; i++) {
      const player1 = playerOrder[i];
      const player2 = playerOrder[numPlayers - 1 - i];

      if (player1 !== null && player2 !== null) {
        const match = {
          teamA: player1,
          teamB: player2,
          court: getRandomCourt(courtArray),
          type: "winner's bracket",
          tournamentId: tournamentId,
          date: round == 0 ? date : null,
          round,
          winner: null,
          loser: null,
        };
        currentRoundMatches.push(match);
      }
    }

    // Rotate players in the order array to prevent consecutive matches
    const lastPlayer = playerOrder.pop();
    playerOrder.splice(1, 0, lastPlayer);

    matches.push(currentRoundMatches);
  }

  return matches;
};

const loserBracketGenerator = (numbersRow, tournamentId, courtArray) => {
  let bluePrintLoser = [
    [
      {
        teamA: null,
        teamB: null,
        court: getRandomCourt(courtArray),
        type: "loser's bracket",
        tournamentId: tournamentId,
        date: null,
        winner: null,
        loser: null,
      },
    ],
  ];
  for (let i = 0; i < numbersRow; i++) {
    if (i === 0) {
      bluePrintLoser[i] = bluePrintLoser[i];
    } else if (i % 2 !== 0) {
      if (i === 1) {
        bluePrintLoser[i] = bluePrintLoser[0];
      } else {
        bluePrintLoser[i] = [...bluePrintLoser[i - 1]];
      }
    } else if (i !== 0 && i % 2 === 0) {
      bluePrintLoser[i] = [...bluePrintLoser[i - 1], ...bluePrintLoser[i - 2]];
    }
  }
  let tempArrayLength = 0;
  const loserBracket = [];
  let tempCount = 0,
    tempArry = [];
  for (var i = 0; i < bluePrintLoser.length; i++) {
    let innerArray = bluePrintLoser[i];

    if (tempCount + innerArray.length < numbersRow) {
      tempCount = tempCount + innerArray.length;
      loserBracket.push(innerArray);
    } else {
      let tempDiff = numbersRow - tempCount;
      for (var j = 0; j < innerArray.length; j++) {
        if (j < tempDiff) {
          tempArry.push(innerArray[j]);
        }
      }
      break;
    }
  }
  loserBracket.push(tempArry);
  let loser = loserBracket.reverse();
  let tempArr = [];

  for (let j = 0; j < loser.length; j++) {
    let temp = [];
    let lastRoundMatches = 0;
    if (j > 0) {
      lastRoundMatches = loser[j - 1].length;
    }
    for (let i = 0; i < loser[j].length; i++) {
      if (j == 0) {
        temp.push({ ...loser[j][i], round: j + 1, lastRoundTeam: 0 });
      } else {
        temp.push({
          ...loser[j][i],
          round: j + 1,
          lastRoundTeam: lastRoundMatches > 0 ? (lastRoundMatches % 2 == 0 ? 1 : 0.5) : 0,
        });
        lastRoundMatches =
          lastRoundMatches % 2 == 0 && lastRoundMatches > 0
            ? lastRoundMatches - 2
            : lastRoundMatches - 1;
      }
    }
    tempArr.push(temp);
  }
  return tempArr;
};
