const jwt = require("jsonwebtoken");
const axios = require("axios");
const fs = require("fs");
const ErrorResponse = require("../utils/errorResponse");
const pako = require("pako");

const privateKey = `-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQgY+KZrQfksAC+1VcB
olWq921W7BmsChSIyZLfFHP8mJigCgYIKoZIzj0DAQehRANCAASNQWL1SKeE2lbf
8g+qpPlnzYrfRMmFAvKHhwuRtNr4nmJu860zQ5xFGOnG5oi6Ch5HamiOkclOmsE8
xAtAneGP
-----END PRIVATE KEY-----`; // Replace with your actual path
const issuerId = "1ba1df65-0e37-4d69-b8a7-1ee847913606"; // Replace with your issuer ID
const keyId = "73DKXDU457"; // Replace with your key ID
const vendorNumber = "92521699"; // Replace with your vendor number

// @desc
exports.appleReport = async (req, res, next) => {
  try {
    const token = generateToken();

    console.log(token, "token");
    const response = await axios
      .get("https://api.appstoreconnect.apple.com/v1/salesReports", {
        headers: {
          Authorization: `Bearer ${token}`,
          // Accept: "application/xml",
        },

        params: {
          "filter[frequency]": "DAILY",
          "filter[reportDate]": "2024-05-26",
          "filter[reportSubType]": "SUMMARY",
          "filter[reportType]": "SALES",
          "filter[vendorNumber]": vendorNumber,
        },
      })
      .then(async (data) => {
        let original_str = pako.ungzip(data.data, { to: "string" });
        console.log(original_str, "original_str");
        return original_str;
      });
    // console.log(response, "response");
    res.send({});
  } catch (err) {
    // console.log(err, err.message, err?.response?.data);
    return next(new ErrorResponse(err, 400));
  }
};

const generateToken = () => {
  let now = Math.round(new Date().getTime() / 1000); // Notice the /1000
  let nowPlus20 = now + 1199; // 1200 === 20 minutes

  let payload = {
    iss: issuerId,
    exp: nowPlus20,
    aud: "appstoreconnect-v1",
    // scope: ["GET /v1/apps?filter[platform]=IOS"],
  };

  let signOptions = {
    algorithm: "ES256", // you must use this algorythm, not jsonwebtoken's default
    header: {
      alg: "ES256",
      kid: keyId,
      typ: "JWT",
    },
  };

  return jwt.sign(payload, privateKey, signOptions);
};
