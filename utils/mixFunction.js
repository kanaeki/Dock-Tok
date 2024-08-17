// Remove Special Characters from the string
exports.stringCleaner = (str = "") => {
  const specialCharsSpacesAndUpperCaseRegex = /[^a-zA-Z0-9.]/g;

  // Use the replace() method with the regular expression to remove special characters, spaces, and uppercase letters
  const cleanString = str
    .replace(specialCharsSpacesAndUpperCaseRegex, "")
    .toLowerCase();
  return encodeURIComponent(cleanString);
};

// @Description: Get First Character from two strings and Combine them into a single
exports.getFirstCharacter = (str1, str2) => {
  return str1.charAt(0).toUpperCase() + str2.charAt(0).toUpperCase();
};

exports.courtShuffler = (inputArray) => {
  const newArray = [];
  inputArray.forEach((item) => {
    const { courtId, totalNumber } = item;
    for (let i = 1; i <= totalNumber; i++) {
      newArray.push({
        courtId,
        courtNumber: i,
      });
    }
  });
  return newArray;
};

const shuffleArrayCourt = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

exports.getRandomCourt = (courtArray) => {
  shuffleArrayCourt(courtArray);
  return courtArray[0];
};

exports.nearestPowerOf2Downward = (number) => {
  let power = 0;
  while (Math.pow(2, power) <= number) {
    power++;
  }
  return Math.pow(2, power - 1);
};

exports.subtractAndCalculateTeams = (
  teamsArray,
  subtractCount,
  totalTeamCount,
) => {
  const subtractedTeams = [];
  const totalTeams = [];
  let subtractedCount = 0;

  for (const team of teamsArray) {
    if (subtractedCount < subtractCount) {
      subtractedTeams.push(team);
      subtractedCount++;
    } else {
      totalTeams.push(team);
    }
  }

  // Add nulls for any missing teams
  while (totalTeams.length < totalTeamCount) {
    totalTeams.push(null);
  }

  return {
    totalTeams,
    subtractedTeams,
  };
};
exports.convertPointsToRating = (points, maxPoints, minRating, maxRating) => {
  let percent = parseInt(points);
  let halfstars = percent / 20;

  return halfstars > 5 ? 5 : halfstars < 1 ? 1 : halfstars;
};
exports.convertRatingToPoints = (rating, maxPoints, minRating, maxRating) => {
  const minPoints = 500;
  const points =
    ((rating - minRating) * (maxPoints - minPoints)) / (maxRating - minRating) +
    minPoints;
  return points;
};
exports.calculateExpectedOutcome = (ratingA, ratingB) => {
  const expectedA = 1 / (1 + 10 ** ((ratingB - ratingA) / 400));
  return expectedA;
};

exports.getDateYearsAgo = (numberOfYear = 0) => {
  const today = new Date();
  const yearAgo = new Date(
    today.getFullYear() - numberOfYear,
    today.getMonth(),
    today.getDate(),
  );
  return yearAgo;
};

exports.addMissingFormatsWithZeroCount = (countsArray) => {
  const formats = ["single_elimination", "double_elimination", "round_robin"];
  const formatMap = countsArray.reduce((map, item) => {
    map[item.format] = item.count;
    return map;
  }, {});

  const result = formats.map((format) => ({
    format,
    count: formatMap[format] || 0,
  }));

  return result;
};

exports.addMissingStatusWithZeroCount = (countsArray) => {
  const status = ["applicationOpen", "start", "closed", "cancel"];
  const statusMap = countsArray.reduce((map, item) => {
    map[item.status] = item.count;
    return map;
  }, {});

  const result = status.map((status) => ({
    status,
    count: statusMap[status] || 0,
  }));

  return result.sort((a, b) => b.count - a.count);
};
exports.addMissingGroupTypeWithZeroCount = (countsArray) => {
  const type = ["private", "public"];
  const typeMap = countsArray.reduce((map, item) => {
    map[item.type] = item.count;
    return map;
  }, {});

  const result = type.map((type) => ({
    type,
    count: typeMap[type] || 0,
  }));

  return result.sort((a, b) => b.count - a.count);
};

exports.addMissingChallengeStatusWithZeroCount = (countsArray) => {
  const statues = [
    "requested",
    "accepted",
    "changeRequested",
    "rejected",
    "verifiedScore",
    "verifiedScoreRejected",
    "closed",
  ];
  const statusMap = countsArray.reduce((map, item) => {
    map[item.status] = item.count;
    return map;
  }, {});

  const result = statues.map((status) => ({
    status:
      status == "requested"
        ? "Requested"
        : status == "accepted"
          ? "Accepted"
          : status == "rejected"
            ? "Rejected"
            : status == "closed"
              ? "Closed"
              : status == "changeRequested"
                ? "Change Request"
                : status == "verifyScore"
                  ? "Verify Score"
                  : "Verify Score Rejected",
    count: statusMap[status] || 0,
  }));

  return result.sort((a, b) => b.count - a.count);
};
exports.addMissingChallengeFormatWithZeroCount = (countsArray) => {
  const statues = ["single", "double", "mixDouble"];
  const formatMap = countsArray.reduce((map, item) => {
    map[item.format] = item.count;
    return map;
  }, {});

  const result = statues.map((format) => ({
    format,
    count: formatMap[format] || 0,
  }));

  return result.sort((a, b) => b.count - a.count);
};

exports.findMintes = (timeStamp) => {
  const givenTimestamp = timeStamp;

  // Current timestamp
  const currentTimestamp = Date.now();

  // Calculate the difference in milliseconds
  const differenceInMilliseconds = givenTimestamp - currentTimestamp;

  // Convert milliseconds to minutes
  const differenceInMinutes = Math.floor(differenceInMilliseconds / 1000 / 60);
  return differenceInMinutes;
};

exports.formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Add leading zero if needed
  const day = String(date.getDate()).padStart(2, "0"); // Add leading zero if needed
  return `${year}-${month}-${day}`;
};
