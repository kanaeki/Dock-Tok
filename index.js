require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");
const connectDB = require("./config/db.js");
const { logger } = require("./middleware/logger");
const errorHandler = require("./middleware/error");
const corsOptions = require("./config/corsOptions");
const path = require("path");
const { initializeSocket } = require("./utils/sockets.js");
const { seedCategories } = require("./models/seeders/category");

//Set Logger
app.use(logger);
//Setting  Cors
app.use(cors(corsOptions));
//Setting  Only Accept Json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// render react file
// Testing  Router

//Connecting Mongooes
connectDB().then(() => {
  seedCategories();
});

app.use("/api/v1/auth", require("./routes/authentication"));
app.use("/api/v1/google", require("./routes/google"));
app.use("/api/v1/facebook", require("./routes/facebook"));
app.use("/api/v1/upload", require("./routes/upload"));
app.use("/api/v1/video", require("./routes/video"));
app.use("/api/v1/blog", require("./routes/blog"));
app.use("/api/v1/topic", require("./routes/topic"));
app.use("/api/v1/user", require("./routes/user"));
app.use("/api/v1/report", require("./routes/report"));
app.use("/api/v1/notification", require("./routes/notification"));
app.use("/api/v1/template", require("./routes/email.js"));
app.use("/api/v1/flush", require("./routes/flush.js"));
app.use("/api/v1/mail", require("./routes/mail.js"));
app.use("/api/v1/staff", require("./routes/staff.js"));
app.use("/api/v1/award", require("./routes/award.js"));
app.use("/api/v1/search", require("./routes/search.js"));

app.get("/api/v1/test", (req, res, next) => {
  res.send("DockTokApp live Api are Server");
  console.log("test server");
});

// Error Handler Middleware
app.use(errorHandler);
//Setting  Port
const PORT = process.env.PORT || 5000;
//Start Server
const server = app.listen(PORT, () =>
  console.log(` DockTokApp Sever running on port ${PORT}`),
);

initializeSocket(server);

//Server Handler
process.on("unhandledRejection", (err, promise) => {
  console.log(`Logged Error: ${err.message}`);
  server.close(() => process.exit(1));
});
