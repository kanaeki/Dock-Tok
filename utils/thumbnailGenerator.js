const ffprobePath = require("@ffprobe-installer/ffprobe").path;
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const generateThumbnail = (mediaPath, thumbnailPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(mediaPath)
      .on("end", () => resolve(thumbnailPath))
      .on("error", reject)
      .screenshots({
        count: 1,
        filename: path.basename(thumbnailPath),
        folder: path.dirname(thumbnailPath),
      });
  });
};

module.exports = generateThumbnail;
