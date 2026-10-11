// ==========================================
// SEND OTP EMAIL
// RESEND HTTPS API
// NO NODEMAILER
// NO SMTP
// ==========================================

const sendOTPEmail = async (
  email,
  username,
  otp
) => {
  try {
    // ==========================================
    // CHECK RESEND API KEY
    // ==========================================

    if (!process.env.RESEND_API_KEY) {
      console.error(
        "❌ RESEND_API_KEY is missing"
      );

      throw new Error(
        "RESEND_API_KEY is missing"
      );
    }

    // ==========================================
    // CHECK FROM EMAIL
    // ==========================================

    if (!process.env.RESEND_FROM_EMAIL) {
      console.error(
        "❌ RESEND_FROM_EMAIL is missing"
      );

      throw new Error(
        "RESEND_FROM_EMAIL is missing"
      );
    }

    // ==========================================
    // VALIDATION
    // ==========================================

    if (!email) {
      throw new Error(
        "Recipient email is required"
      );
    }

    if (!otp) {
      throw new Error(
        "OTP is required"
      );
    }

    // ==========================================
    // SAFE USERNAME
    // ==========================================

    const safeUsername =
      String(username || "User")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    // ==========================================
    // TEXT EMAIL
    // ==========================================

    const text = `
Hello ${username || "User"},

Your FreelanceFlow password reset OTP is:

${otp}

This OTP is valid for 10 minutes.

If you did not request a password reset,
please ignore this email.

Regards,
FreelanceFlow Team
`;

    // ==========================================
    // HTML EMAIL
    // ==========================================

    const html = `
<!DOCTYPE html>

<html lang="en">

<head>

  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>FreelanceFlow Password Reset</title>

</head>

<body
  style="
    margin:0;
    padding:0;
    background:#f1f5f9;
    font-family:Arial,Helvetica,sans-serif;
  "
>

  <div
    style="
      max-width:600px;
      margin:40px auto;
      background:#ffffff;
      border-radius:18px;
      overflow:hidden;
      box-shadow:0 10px 30px rgba(15,23,42,0.08);
    "
  >

    <!-- HEADER -->

    <div
      style="
        background:linear-gradient(
          135deg,
          #2563eb,
          #4f46e5
        );
        padding:30px;
        text-align:center;
        color:#ffffff;
      "
    >

      <h1
        style="
          margin:0;
          font-size:27px;
        "
      >
        FreelanceFlow
      </h1>

      <p
        style="
          margin:8px 0 0;
          opacity:0.9;
          font-size:14px;
        "
      >
        Password Reset
      </p>

    </div>


    <!-- CONTENT -->

    <div
      style="
        padding:35px 30px;
      "
    >

      <h2
        style="
          margin-top:0;
          color:#0f172a;
          font-size:22px;
        "
      >
        Hello ${safeUsername} 👋
      </h2>

      <p
        style="
          color:#475569;
          line-height:1.7;
          font-size:15px;
        "
      >
        We received a request to reset your
        FreelanceFlow account password.
      </p>

      <p
        style="
          color:#475569;
          line-height:1.7;
          font-size:15px;
        "
      >
        Use the OTP below to continue:
      </p>


      <!-- OTP BOX -->

      <div
        style="
          margin:30px 0;
          padding:24px;
          background:#eff6ff;
          border:1px solid #bfdbfe;
          border-radius:14px;
          text-align:center;
        "
      >

        <div
          style="
            color:#64748b;
            font-size:12px;
            font-weight:bold;
            letter-spacing:1px;
            margin-bottom:10px;
          "
        >
          YOUR OTP
        </div>

        <div
          style="
            color:#1d4ed8;
            font-size:36px;
            font-weight:bold;
            letter-spacing:9px;
          "
        >
          ${otp}
        </div>

      </div>


      <!-- EXPIRY -->

      <p
        style="
          color:#64748b;
          font-size:14px;
          line-height:1.6;
        "
      >
        ⏱️ This OTP will expire in
        <strong>10 minutes</strong>.
      </p>


      <!-- SECURITY -->

      <div
        style="
          margin-top:20px;
          padding:15px 18px;
          background:#f8fafc;
          border:1px solid #e2e8f0;
          border-radius:10px;
        "
      >

        <p
          style="
            margin:0;
            color:#64748b;
            font-size:13px;
            line-height:1.6;
          "
        >
          🔒 If you did not request a password
          reset, you can safely ignore this email.
        </p>

      </div>

    </div>


    <!-- FOOTER -->

    <div
      style="
        padding:20px 30px;
        background:#f8fafc;
        border-top:1px solid #e5e7eb;
        text-align:center;
        color:#94a3b8;
        font-size:12px;
      "
    >

      © ${new Date().getFullYear()}
      FreelanceFlow

    </div>

  </div>

</body>

</html>
`;

    // ==========================================
    // SEND THROUGH RESEND
    // ==========================================

    console.log("");
    console.log(
      "================================="
    );

    console.log(
      "📧 SENDING OTP EMAIL"
    );

    console.log(
      "To:",
      email
    );

    console.log(
      "From:",
      process.env.RESEND_FROM_EMAIL
    );

    console.log(
      "API Key Exists:",
      Boolean(
        process.env.RESEND_API_KEY
      )
    );

    console.log(
      "================================="
    );


    let response;

    try {

      response = await fetch(
        "https://api.resend.com/emails",
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${process.env.RESEND_API_KEY}`,

            "Content-Type":
              "application/json",

            Accept:
              "application/json",
          },

          body: JSON.stringify({

            from:
              process.env.RESEND_FROM_EMAIL,

            to: [
              email,
            ],

            subject:
              "Your FreelanceFlow Password Reset OTP",

            text,

            html,

          }),
        }
      );

    } catch (fetchError) {

      console.error("");
      console.error(
        "================================="
      );

      console.error(
        "❌ RESEND CONNECTION ERROR"
      );

      console.error(
        "Message:",
        fetchError.message
      );

      console.error(
        "Cause:",
        fetchError.cause
      );

      console.error(
        "================================="
      );

      throw new Error(
        "Unable to connect to Resend email service"
      );
    }


    // ==========================================
    // RESEND RESPONSE
    // ==========================================

    let data = {};

    try {

      data =
        await response.json();

    } catch (jsonError) {

      console.error(
        "❌ Resend response JSON error:",
        jsonError.message
      );

    }


    console.log("");
    console.log(
      "================================="
    );

    console.log(
      "📨 RESEND OTP RESPONSE"
    );

    console.log(
      "Status:",
      response.status
    );

    console.log(
      "Response:",
      data
    );

    console.log(
      "================================="
    );


    // ==========================================
    // HANDLE RESEND ERROR
    // ==========================================

    if (!response.ok) {

      const errorMessage =
        data?.message ||
        data?.error ||
        "Failed to send OTP email";

      console.error(
        "❌ OTP EMAIL ERROR:",
        errorMessage
      );

      throw new Error(
        errorMessage
      );
    }


    // ==========================================
    // SUCCESS
    // ==========================================

    console.log("");
    console.log(
      "================================="
    );

    console.log(
      "✅ OTP EMAIL SENT SUCCESSFULLY"
    );

    console.log(
      "Resend ID:",
      data?.id
    );

    console.log(
      "================================="
    );

    return data;

  } catch (error) {

    console.error("");
    console.error(
      "================================="
    );

    console.error(
      "❌ SEND OTP EMAIL ERROR"
    );

    console.error(
      "Message:",
      error.message
    );

    console.error(
      "================================="
    );

    throw error;
  }
};


// ==========================================
// EXPORT
// ==========================================

module.exports = {
  sendOTPEmail,
};