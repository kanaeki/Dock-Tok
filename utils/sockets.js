const { Server } = require("socket.io");
const Comment = require("../models/Comment");
const { default: mongoose } = require("mongoose");
const Video = require("../models/Video");

let io;

const initializeSocket = (server) => {
  io = new Server(server);

  io.on("connection", (socket) => {
    console.log(`${socket.id}user Connected`);

    socket.on("joinVideo", (videoId) => {
      const prevRoom = socket.id?.room;
      if (prevRoom) {
        socket.leave(prevRoom);
      }
      socket.join(videoId);
      console.log(`${socket.id.substring(0, 4)} joined video room: ${videoId}`);
    });
    socket.on("leaveVideo", (videoId) => {
      socket.leave(videoId);
      console.log(`User left video room: ${videoId}`);
    });

    socket.on("newComment", async function (videoId, userId, msg) {
      try {
        console.log(videoId);

        const newComment = await Comment.create({
          videoId: new mongoose.Types.ObjectId(videoId),
          content: msg,
          createdBy: new mongoose.Types.ObjectId(userId),
          modifiedBy: new mongoose.Types.ObjectId(userId),
        });

        socket.to(videoId).emit("Comment", newComment);
      } catch (err) {
        console.log(err);
      }
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
};

module.exports = {
  initializeSocket,
};
