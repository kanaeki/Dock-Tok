const Notification = require("../models/Notification");
const { admin } = require("../config/firebase/firebaseConfig");

exports.createNotification = async (
  title,
  message,
  recipient,
  fcmAndroidApp,
  data,
  type,
  sender,
) => {
  await Notification.create({
    title: title,
    message: message,
    recipient: recipient,
    data,
    type,
    sender,
  });

  const registrationTokens = fcmAndroidApp;
  // console.log(data, typeof data);
  const msg = {
    notification: {
      title: title,
      body: message,
    },
    data: data,
    tokens: [registrationTokens],
    // priority: 'high',
    // apns: {
    //   payload: {
    //     aps: {
    //       contentAvailable: true,
    //     },
    //   },
    //   headers: {
    //     'apns-push-type': 'background',
    //     'apns-priority': '5',
    //     'apns-topic': 'com..dockTokApp.pickleball', // your app bundle identifier
    //   },
    // },
  };
  admin
    .messaging()
    .sendMulticast(msg)
    .then((response) => {
      return true;
    })
    .catch((error) => {
      return false;
    });
};

exports.notification = async (data) => {
  const registrationTokens = data.fcmTokens;

  const message = {
    notification: {
      title: data.title,
      body: data.body,
    },
    tokens: registrationTokens,
  };
  // .messaging()
  // .sendMulticast(message)
  // .then((response) => {
  //   return true;
  // })
  // .catch((error) => {
  //   return false;
  // });
};
exports.sendNotificationToAll = async (data) => {
  const message = {
    notification: {
      title: data.title,
      body: data.body,
    },
    data: data.data,
    tokens: [data.tokens.toString()],
  };
  admin
    .messaging()
    .sendMulticast(message)
    .then((response) => {
      return true;
    })
    .catch((error) => {
      return false;
    });
};
