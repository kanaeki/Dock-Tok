const nodemailer = require("nodemailer");
const crypto = require("crypto");
const User = require("../models/User");
const sendEmail = (options) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: options.to,
    cc: options.cc || "",
    subject: options.subject,
    html: `${options.text}`,
  };
  transporter.sendMail(mailOptions, function (err, info) {
    if (err) {
    } else {
    }
  });
};

const sendMails = async (users) => {
  for (element of users) {
    const encodedUserId = Buffer.from(element._id.toString()).toString(
      "base64",
    );

    const unsubscribeLink = `http://localhost:4000/api/v1/mail/unsubscribe?user=${encodedUserId}`;
    const values = {
      user: element.createdBy.firstName,
      header: "NEW BLOG",
      content: "A new Blog has been Added",
      btnLink: unsubscribeLink,
      btnText: "Unsubscribe",
    };
    let message = mail(values);
    sendEmail({
      to: element.email,
      subject: "new Blog Mail",
      text: message,
    });
  }
};

const winnerMail = async (email, name) => {
  const values = {
    user: name,
    header: "CONGRATULATIONS",
    content: "You have won the challange",
    btnText: "visit Site",
  };
  let message = mail(values);

  sendEmail({
    to: email,
    subject: "Winner",
    text: message,
  });
};

const staffMail = async (user) => {
  const resetToken = user.getResetPasswordToken();
  await user.save();
  let resetLink = `http://localhost:4000/api/v1/staff/reset-password?token=${resetToken}`;

  const values = {
    user: user.firstName,
    header: "CONGRATULATIONS",
    content: "You are now part of the Docktok Team",
    btnLink: resetLink,
    btnText: "Reset Password",
  };
  let message = mail(values);

  sendEmail({
    to: user.email,
    subject: "Account Creation",
    text: message,
  });
};
const mail = (options) => {
  return (message = `
  <!DOCTYPE html>
<html lang='en'>
  <head>
    <meta charset='UTF-8' />
    <meta name='viewport' content='width=device-width, initial-scale=1.0' />
    <link
      href='https://fonts.googleapis.com/css?family=Barlow'
      rel='stylesheet'
    />
    <title>Responsive Email Template</title>
    <style>
     
    </style>
  </head>
  <body style="color: #666666; font-family: Barlow; font-size: 16px">
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td align='center'>
          <table
            class='content'
            width='600'
            border='0'
            cellspacing='0'
            cellpadding='0'
            style='border-collapse: collapse; border: 1px solid #cccccc'
          >
            <tr>
              <td
                class='black'
                style='
                  text-align: center;
                  font-size: 26px;
                  font-weight: 500;
                  padding-top: 30px;
                '
              >
                <img src='./Vector.png' alt='logo' />
                <br />
                <span style="color: #252525">HI ${options.user?.toUpperCase() || "User"}</span>
                <br />
                <span style="font-size: 18px; color: #252525"
                  >${options.header} </span
                >
              </td>
            </tr>
            <tr>
              <td
                class='body'
                style='
                  padding: 40px;
                  text-align: left;
                  font-size: 16px;
                  line-height: 1.6;
                  color: #666666;
                '
              >
                   ${options.content}
                <br />
              </td>
            </tr>
            <tr>
                <td align="center">
                    <a href=${options.btnLink}>
                        <button style="cursor: pointer;padding: 8px; background: #64B98B; color: white; border: 2px solid #64B98B; border-radius: 5px;">
                        ${options.btnText}
                        </button>
                    </a>
                </td>
            </tr>
           <tr>
            <td>
                <hr width='20%' color='#666666'/>
            </td>
           </tr>
            <tr>
              <td
                class='body black'
                style='
                  text-align: center;
                  font-size: 18px;
                  font-weight: 500;
                  line-height: 1.6;
                  color: #252525;
                '
              >
                Start Uploading videos
              </td>
            </tr>
            <tr>
              <td
                class='body'
                style='
                  padding: 40px;
                  text-align: center;
                  font-size: 16px;
                  line-height: 1.6;
                  color: #666666;
                '
              >
                Lorem ipsum dolor sit amet consectetur adipiscing elit Ut et
                massa mi. Aliquam in hendrerit.
              </td>
            </tr>
            <tr style="font-size: 14px">
              <td class="footer">
                <table align="center">
                  <tr>
                    <td
                      align='center'
                      style='display: flex; gap: 10px; justify-content: center;text-align: center;'
                    >
                      <img src='./Frame.png' alt='logo' /><img
                        src='./Frame (1).png'
                        alt='logo'
                      /><img src='./Frame (2).png' alt='logo' />
                    </td>
                  </tr>
                  <tr>
                    <td align='center'>
                      <img src='./Vector (1).png' alt='logo' />
                    </td>
                  </tr>
                  <tr>
                    <td style='color: #666666;' align='center'>Copyright © 2020</td>
                  </tr>
                  <tr>
                    <td style='color: #666666;' align='center'>DockTok Rewards & Recognition.</td>
                  </tr>
                  <tr>
                    <td style='color: #666666;' align='center'>
                      A better company begins with a personalises employee
                      experience.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr></tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `);
};

module.exports = { sendEmail, sendMails, winnerMail, staffMail, mail };
