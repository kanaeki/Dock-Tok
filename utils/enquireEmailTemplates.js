exports.thankYouTemplate = () => {
  return `
<!DOCTYPE html>
<html lang="en">
   <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link
         href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,400;0,700;1,300&display=swap"
         rel="stylesheet"
         />
      <style>
         *,
         *::before,
         *::after {
         margin: 0;
         padding: 0;
         }
         body {
         font-family: "Roboto", sans-serif;
         font-weight: 400;
         background-color: #fff;
         line-height: 1.3;
         display: flex;
         justify-content: center;
         align-items: center;
         height: 100vh;
         }
         .container {
         max-width: 600px;
         margin: 0 auto;
         }
         .mb-20 {
         margin-bottom: 20px;
         }
         .greetings {
         text-align: center;
         }
         .heading-tertiary {
         margin-top: 8px;
         margin-bottom: 16px;
         color: #1e1e1e;
         font-weight: bold !important;
         font-family: "Axia", sans-serif;
         line-height: 1.4em;
         }
         .f-56 {
         font-size: clamp(28px, 3.86vw, 56px);
         }
         .f-45 {
         font-size: clamp(22px, 3vw, 45px) !important;
         }
         .f-30 {
         font-size: clamp(20px, 2.3vw, 30px) !important;
         }
         .f-20 {
         font-size: clamp(14px, 1.38vw, 20px);
         }
         .f-18 {
         font-size: clamp(12px, 1.24vw, 18px);
         }
         .f-24 {
         font-size: clamp(16px, 1.66vw, 24px) !important;
         }
         .f-18 {
         font-size: clamp(12px, 1.24vw, 18px) !important;
         }
         .container {
         border: 1px solid #eee;
         }
         ..dockTokApp {
         padding: 0px;
         }
         .need-help-text {
         text-align: center;
         }
         ..dockTokApp_header {
         background-color: #fff;
         display: flex;
         justify-content: center;
         z-index: 0;
         }
         ..dockTokApp-container {
         max-width: 700px;
         margin: 0 auto;
         padding-bottom: 0px;
         padding: 20px;
         }
         ..dockTokApp_header img {
         width: 100%;
         }
         ..dockTokApp_body {
         padding: 28px 32px;
         background-color: #ffffff;
         margin-top: -100px;
         z-index: 99;
         border: 1px solid #e0e0e0;
         box-shadow: 0 3px 15px #0000001a;
         position: relative;
         }
         ..dockTokApp_body p {
         font-size: clamp(14px, 1.38vw, 16px) !important;
         }
         .h-primary {
         color: #0f0f0f;
         font-weight: 600;
         text-align: left;
         margin-bottom: 22px;
         }
         h1 {
         text-align: center;
         }
         ..dockTokApp-card {
         }
         .btn {
         background-color: #5c83ea;
         color: #fff;
         padding: 14px 24px;
         text-align: center;
         border: 0;
         box-shadow: 0 3px 8px #26262641;
         }
         .btn-box {
         text-align: center;
         margin: 32px 0;
         }
         .btn--confirm {
         }
         .text {
         text-align: left;
         }
         .password {
         padding: 12px 0 18px 0;
         color: #ba4d3e !important;
         font-weight: 400;
         }
         .cheers {
         margin-top: 38px;
         margin-bottom: 4px;
         color: #484848;
         }
         .h-secondary {
         color: #000000;
         font-weight: 400;
         }
         .help {
         background-color: #5c83ea33;
         padding: 18px 0;
         text-align: center;
         max-width: 600px;
         margin: 0 auto;
         }
         .help p {
         color: #000000;
         margin-bottom: 3px;
         }
         ..dockTokApp-label {
         font-size: clamp(14px, 1.38vw, 20px) !important;
         font-weight: 600;
         }
         .text-color {
         color: #449f45;
         }
         .dashboard {
         padding-left: 50px;
         color: #000000;
         }
         .copyright {
         color: #484848;
         margin-top: 25px;
         text-align: center;
         font-size: clamp(14px, 1.38vw, 16px) !important;
         }
         .bg-color {
         background: #ebf7eb;
         }
         .bg-color p {
         padding: 20px 30px;
         }
         @media (max-width: 767px) {
         .container {
         width: 100%;
         }
         .copyright {
         margin-top: 24px;
         }
         }
      </style>
      <title>Email Template</title>
   </head>
   <body>
      <div className="container">
         <section className=".dockTokApp">
            <div className=".dockTokApp_header">
               <img src="http://.dockTokApp.pixarsclients.com/img/email/bg.png" alt="" />
            </div>
            <div className=".dockTokApp-container">
               <div className=".dockTokApp_body mb-20">
                  <div className=".dockTokApp-card">
                     <div className=".dockTokApp-inner-wrapper mb-20">
                        <h1 className="f-30 fw-normal mb-20">Thankyou</h1>
                        <p className="text mb-20">Your request has been submitted successfully. Our team will be contact you in the next 24 hours.</p>
                     </div>
                  </div>
               </div>
               <div className="bg-color">
                  <p className="greetings">
                  If you have any questions, please
                     reach out to us at
                     <a href="mailto:support@.dockTokApp.com" className="text-color">
                     support@.dockTokApp.com</a
                        >, or contact your assigned contact manager.
                  </p>
               </div>
               <div className="billing">
                  <p className="copyright">
                     Copyright &copy; .dockTokApp, All Rights Reserved
                  </p>
               </div>
            </div>
         </section>
      </div>
   </body>
</html>

    
    `;
};

exports.detailTemplate = (payload) => {
  const { firstName, lastName, position, organization, email, comment } =
    payload;

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,400;0,700;1,300&display=swap"
      rel="stylesheet"
    />
    <style>
      *,
      *::before,
      *::after {
        margin: 0;
        padding: 0;
      }
      body {
        font-family: "Roboto", sans-serif;
        font-weight: 400;
        background-color: #fff;
        line-height: 1.3;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
      }
      .mb-20 {
        margin-bottom: 20px;
      }
      .greetings {
        text-align: center;
      }
      .heading-tertiary {
        margin-top: 8px;
        margin-bottom: 16px;
        color: #1e1e1e;
        font-weight: bold !important;
        font-family: "Axia", sans-serif;
        line-height: 1.4em;
      }
      .f-56 {
        font-size: clamp(28px, 3.86vw, 56px);
      }
      .f-45 {
        font-size: clamp(22px, 3vw, 45px) !important;
      }
      .f-30 {
        font-size: clamp(20px, 2.3vw, 30px) !important;
      }
      .f-20 {
        font-size: clamp(14px, 1.38vw, 20px);
      }
      .f-18 {
        font-size: clamp(12px, 1.24vw, 18px);
      }
      .f-24 {
        font-size: clamp(16px, 1.66vw, 24px) !important;
      }
      .f-18 {
        font-size: clamp(12px, 1.24vw, 18px) !important;
      }
      table {
        width: 100%;
      }
      th,
      td {
        text-align: left;
      }
      .container {
        border: 1px solid #eee;
      }
      ..dockTokApp {
        padding: 0px;
      }
      .need-help-text {
        text-align: center;
      }
      ..dockTokApp_header {
        background-color: #fff;
        display: flex;
        justify-content: center;
        z-index: 0;
      }
      ..dockTokApp-container {
        max-width: 700px;
        margin: 0 auto;
        padding-bottom: 0px;
        padding: 20px;
      }
      ..dockTokApp_header img {
        width: 100%;
      }
      ..dockTokApp_body {
        padding: 28px 32px;
        background-color: #ffffff;
        margin-top: -100px;
        z-index: 99;
        border: 1px solid #e0e0e0;
        box-shadow: 0 3px 15px #0000001a;
        position: relative;
      }
      ..dockTokApp_body p {
        font-size: clamp(14px, 1.38vw, 16px) !important;
      }
      .h-primary {
        color: #0f0f0f;
        font-weight: 600;
        text-align: left;
        margin-bottom: 22px;
      }
      h1 {
        text-align: center;
      }
      ..dockTokApp-card {
      }
      .btn {
        background-color: #5c83ea;
        color: #fff;
        padding: 14px 24px;
        text-align: center;
        border: 0;
        box-shadow: 0 3px 8px #26262641;
      }
      .btn-box {
        text-align: center;
        margin: 32px 0;
      }
      .btn--confirm {
      }
      .text {
        text-align: left;
      }
      .password {
        padding: 12px 0 18px 0;
        color: #ba4d3e !important;
        font-weight: 400;
      }
      .cheers {
        margin-top: 38px;
        margin-bottom: 4px;
        color: #484848;
      }
      .h-secondary {
        color: #000000;
        font-weight: 400;
      }
      .help {
        background-color: #5c83ea33;
        padding: 18px 0;
        text-align: center;
        max-width: 600px;
        margin: 0 auto;
      }
      .help p {
        color: #000000;
        margin-bottom: 3px;
      }
      ..dockTokApp-label {
        font-size: clamp(14px, 1.38vw, 20px) !important;
        font-weight: 600;
      }
      .text-color {
        color: #449f45;
      }
      .dashboard {
        padding-left: 50px;
        color: #000000;
      }
      .copyright {
        color: #484848;
        margin-top: 25px;
        text-align: center;
        font-size: clamp(14px, 1.38vw, 16px) !important;
      }
      .bg-color {
        background: #ebf7eb;
      }
      .bg-color p {
        padding: 20px 30px;
      }
      @media (max-width: 767px) {
        .container {
          width: 100%;
        }
        .copyright {
          margin-top: 24px;
        }
      }
    </style>
    <title>Email Template</title>
  </head>
  <body>
    <div className="container">
      <section className=".dockTokApp">
        <div className=".dockTokApp_header">
          <img src="http://.dockTokApp.pixarsclients.com/img/email/bg.png" alt="" />
        </div>
        <div className=".dockTokApp-container">
          <div className=".dockTokApp_body mb-20">
            <div className=".dockTokApp-card">
              <div className=".dockTokApp-inner-wrapper mb-20">
                <h1 className="f-30 fw-normal mb-20">Enquire Detail</h1>
                <p className="text mb-20">
                <table>
                  <tr>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Organization</th>
                    <th>Position</th>
                  </tr>
                  <tr>
                    <td>${firstName} ${lastName}</td>
                    <td>${email}</td>
                    <td>${organization}</td>
                    <td>${position}</td>
                  </tr>
                </table>
                </p>
                <p className="text mb-20"><b>Message:</b> <br />${comment}</p>
              </div>
            </div>
          </div>
          <div className="billing">
            <p className="copyright">
              Copyright &copy; .dockTokApp, All Rights Reserved
            </p>
          </div>
        </div>
      </section>
    </div>
  </body>
</html>

    
    `;
};
