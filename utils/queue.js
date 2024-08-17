const Agenda = require("agenda");
const { sendNotificationToAll } = require("./notification");
const { MESSAGE } = require("../Constant/message");
const Notification = require("../models/Notification");
const { sendMails } = require("./sendEmail");

const agenda = new Agenda({
  db: {
    address: process.env.DATABASE_CONNECTION,
    collection: "jobs",
  },
});

agenda.define("sendNotification", async (job, done) => {
  const { title, message, type, fcmTokens, id } = job.attrs.data;
  try {
    await sendNotificationToAll({
      title: title, //title
      body: message, //message
      data: {
        action: type,
        Id: id,
      },
      tokens: fcmTokens, //recipient fcm
    });
    job.remove();
    done();
  } catch (err) {
    done(err);
  }
});

agenda.define("saveJob", async (job, done) => {
  try {
    const { userIds, senderId, id, title, message, type, action } =
      job.attrs.data;

    for (let i = 0; i < job.attrs.data.userIds.length; i++) {
      await Notification.create({
        title: title,
        message: message,
        recipient: userIds[i],
        sender: senderId,
        data: { action: action, id: id },
        type: type,
      });
    }
    job.remove();
    done();
  } catch (err) {
    done(err);
  }
});

agenda.define("sendMail", async (job, done) => {
  try {
    const { mails } = job.attrs.data;

    await sendMails(JSON.parse(mails));
    job.remove();
    done();
  } catch (err) {
    done(err);
  }
});

module.exports = {
  agenda,
};
