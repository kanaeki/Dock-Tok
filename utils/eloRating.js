const { convertPointsToRating, calculateExpectedOutcome } = require('./mixFunction');

exports.getEloRatings = (r1, r2, kFactor, outcome, pointDiff) => {
  // Step 1: Calculate R(1) and R(2)
  const R1 = 10 ** (r1 / 400);
  const R2 = 10 ** (r2 / 400);

  // Step 2: Calculate E(1) and E(2)
  const E1 = R1 / (R1 + R2);
  const E2 = R2 / (R1 + R2);

  // Step 3: Set the actual score
  let S1, S2;

  if (outcome === 'win') {
    S1 = 1;
    S2 = 0;
  } else if (outcome === 'draw') {
    S1 = 0.5;
    S2 = 0.5;
  } else if (outcome === 'loss') {
    S1 = 0;
    S2 = 1;
  } else {
    throw new Error('Invalid outcome. Use "win", "draw", or "loss".');
  }

  // Step 4: Calculate the updated Elo ratings
  const r1New = r1 + kFactor * (S1 - E1) * (1 + 0.1 * pointDiff);
  const r2New = r2 + kFactor * (S2 - E2) * (1 + 0.1 * pointDiff);
  console.log(r1New, r2New, 'a', 'b');
  const ratingA = convertPointsToRating(r1New, 4000, 1.0, 8.0);
  const ratingB = convertPointsToRating(r2New, 4000, 1.0, 8.0);
  return {
    pointA: parseInt(r1New.toFixed(0)),
    pointB: parseInt(r2New.toFixed(0)),
    ratingA: parseFloat(ratingA.toFixed(2)),
    ratingB: parseFloat(ratingB.toFixed(2)),
  };
};

// Function to update Elo ratings after a match
exports.updateEloRatings = (teamA, teamB, kFactor, pointDiff) => {
  const expectedOutcomeA = calculateExpectedOutcome(
    teamA.reduce((a, b) => a + b, 0),
    teamB.reduce((a, b) => a + b, 0)
  );

  // Update Elo ratings for each player on Team A
  teamA.forEach((rating, index) => {
    const actualOutcomeA = 1; // Assuming Team A won
    const newRating =
      rating + kFactor * (actualOutcomeA - expectedOutcomeA) * (1 + 0.1 * pointDiff);
    teamA[index] = {
      points: parseInt(newRating.toFixed(0)),
      rating: parseFloat(convertPointsToRating(newRating, 4000, 1.0, 8.0).toFixed(2)),
    };
  });

  // Update Elo ratings for each player on Team B

  teamB.forEach((rating, index) => {
    const actualOutcomeB = 0; // Assuming Team B lost
    const newRating =
      rating + kFactor * (actualOutcomeB - (1 - expectedOutcomeA)) * (1 + 0.1 * pointDiff);
    teamB[index] = {
      points: parseInt(newRating.toFixed(0)),
      rating: parseFloat(convertPointsToRating(newRating, 4000, 1.0, 8.0).toFixed(2)),
    };
  });
  return { teamA, teamB };
};
