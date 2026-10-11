// ==========================================
// CONTACT CONTROLLER
// RESEND HTTPS API
// NO NODEMAILER / NO SMTP
// ==========================================

const sendContactMessage = async (req, res) => {
  try {
    // ==========================================
    // GET REQUEST DATA
    // ==========================================

    const {
      name,
      email,
      message,
    } = req.body || {};

    // ==========================================
    // CHECK RESEND API KEY
    // ==========================================

    if (!process.env.RESEND_API_KEY) {
      console.error("❌ RESEND_API_KEY is missing");

      return res.status(500).json({
        success: false,
        message: "RESEND_API_KEY is missing on server",
      });
    }

    // ==========================================
    // CHECK RESEND FROM EMAIL
    // ==========================================

    if (!process.env.RESEND_FROM_EMAIL) {
      console.error("❌ RESEND_FROM_EMAIL is missing");

      return res.status(500).json({
        success: false,
        message: "RESEND_FROM_EMAIL is missing on server",
      });
    }

    // ==========================================
    // RECEIVER EMAIL
    // ==========================================

    const receiverEmail =
      process.env.CONTACT_TEST_EMAIL ||
      process.env.EMAIL_USER;

    if (!receiverEmail) {
      console.error(
        "❌ CONTACT_TEST_EMAIL / EMAIL_USER is missing"
      );

      return res.status(500).json({
        success: false,
        message: "Receiver email is not configured",
      });
    }

    // ==========================================
    // REQUIRED FIELD VALIDATION
    // ==========================================

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email and message are required",
      });
    }

    // ==========================================
    // CLEAN DATA
    // ==========================================

    const cleanName = String(name).trim();
    const cleanEmail = String(email).trim();
    const cleanMessage = String(message).trim();

    if (
      !cleanName ||
      !cleanEmail ||
      !cleanMessage
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // ==========================================
    // NAME VALIDATION
    // ==========================================

    if (cleanName.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must contain at least 2 characters",
      });
    }

    if (cleanName.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Name cannot be longer than 100 characters",
      });
    }

    // ==========================================
    // EMAIL VALIDATION
    // ==========================================

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    if (cleanEmail.length > 254) {
      return res.status(400).json({
        success: false,
        message: "Email address is too long",
      });
    }

    // ==========================================
    // MESSAGE VALIDATION
    // ==========================================

    if (cleanMessage.length < 5) {
      return res.status(400).json({
        success: false,
        message: "Message must contain at least 5 characters",
      });
    }

    if (cleanMessage.length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be longer than 5000 characters",
      });
    }

    // ==========================================
    // ESCAPE HTML
    // ==========================================

    const escapeHtml = (value) => {
      return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    const safeName = escapeHtml(cleanName);
    const safeEmail = escapeHtml(cleanEmail);
    const safeMessage = escapeHtml(cleanMessage);

    // ==========================================
    // SUBJECT
    // ==========================================

    const subject =
      `New Contact Message from ${cleanName}`;

    // ==========================================
    // PLAIN TEXT EMAIL
    // ==========================================

    const text = `
New Contact Message

FreelanceFlow Contact Form

Name: ${cleanName}

Email: ${cleanEmail}

Message:

${cleanMessage}

--------------------------------

Reply directly to this email to contact ${cleanName}.
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

  <title>New Contact Message</title>
</head>

<body
  style="
    margin: 0;
    padding: 30px 15px;
    background: #f1f5f9;
    font-family: Arial, Helvetica, sans-serif;
    color: #111827;
  "
>

  <div
    style="
      width: 100%;
      max-width: 650px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid #e5e7eb;
    "
  >

    <!-- HEADER -->

    <div
      style="
        padding: 28px;
        background: linear-gradient(
          135deg,
          #6366f1,
          #8b5cf6
        );
        color: #ffffff;
      "
    >

      <h2
        style="
          margin: 0;
          font-size: 24px;
          line-height: 1.3;
        "
      >
        New Contact Message
      </h2>

      <p
        style="
          margin: 8px 0 0;
          font-size: 14px;
          opacity: 0.9;
        "
      >
        FreelanceFlow Contact Form
      </p>

    </div>

    <!-- CONTENT -->

    <div
      style="
        padding: 28px;
      "
    >

      <p
        style="
          margin: 0 0 20px;
          color: #475569;
          line-height: 1.6;
        "
      >
        You received a new message from your
        FreelanceFlow contact form.
      </p>

      <!-- SENDER DETAILS -->

      <div
        style="
          padding: 18px;
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
        "
      >

        <p
          style="
            margin: 0 0 12px;
            line-height: 1.6;
          "
        >
          <strong>Sender Name:</strong>
          ${safeName}
        </p>

        <p
          style="
            margin: 0;
            line-height: 1.6;
          "
        >
          <strong>Sender Email:</strong>

          <a
            href="mailto:${safeEmail}"
            style="
              color: #6366f1;
              text-decoration: none;
              margin-left: 5px;
            "
          >
            ${safeEmail}
          </a>

        </p>

      </div>

      <!-- MESSAGE -->

      <h3
        style="
          margin: 25px 0 10px;
          font-size: 18px;
          color: #111827;
        "
      >
        Message
      </h3>

      <div
        style="
          padding: 18px;
          background: #f1f5f9;
          border-radius: 12px;
          white-space: pre-wrap;
          line-height: 1.7;
          color: #334155;
          border: 1px solid #e2e8f0;
        "
      >
        ${safeMessage}
      </div>

      <!-- REPLY INFO -->

      <div
        style="
          margin-top: 22px;
          padding: 15px 18px;
          background: #eef2ff;
          border-radius: 10px;
          color: #4338ca;
          font-size: 13px;
          line-height: 1.6;
        "
      >
        💡 Click
        <strong>Reply</strong>
        to respond directly to
        ${safeName}.
      </div>

    </div>

    <!-- FOOTER -->

    <div
      style="
        padding: 16px 28px;
        background: #f8fafc;
        border-top: 1px solid #e5e7eb;
        color: #64748b;
        font-size: 12px;
        line-height: 1.5;
      "
    >
      This email was sent from your
      FreelanceFlow contact form.
    </div>

  </div>

</body>

</html>
`;

    // ==========================================
    // DEBUG INFORMATION
    // ==========================================

    console.log("");
    console.log("=================================");
    console.log("📧 CONTACT EMAIL - RESEND");
    console.log("=================================");

    console.log(
      "From:",
      process.env.RESEND_FROM_EMAIL
    );

    console.log(
      "To:",
      receiverEmail
    );

    console.log(
      "Reply-To:",
      cleanEmail
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

    // ==========================================
    // SEND EMAIL USING RESEND HTTPS API
    // ==========================================

    let resendResponse;

    try {

      resendResponse = await fetch(
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
              receiverEmail,
            ],

            reply_to:
              cleanEmail,

            subject,

            text,

            html,

          }),
        }
      );

    } catch (fetchError) {

      // ==========================================
      // RESEND CONNECTION ERROR
      // ==========================================

      console.error("");
      console.error(
        "================================="
      );

      console.error(
        "❌ RESEND CONNECTION ERROR"
      );

      console.error(
        "================================="
      );

      console.error(
        "Name:",
        fetchError.name
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
        "Stack:",
        fetchError.stack
      );

      console.error(
        "================================="
      );

      return res.status(502).json({
        success: false,
        message:
          "Unable to connect to Resend email service",
        error:
          fetchError.message,
      });
    }

    // ==========================================
    // READ RESEND RESPONSE
    // ==========================================

    let resendData = {};

    try {

      resendData =
        await resendResponse.json();

    } catch (jsonError) {

      console.error(
        "❌ Resend JSON Error:",
        jsonError.message
      );

    }

    // ==========================================
    // RESEND RESPONSE LOG
    // ==========================================

    console.log("");
    console.log(
      "================================="
    );

    console.log(
      "📨 RESEND RESPONSE"
    );

    console.log(
      "Status:",
      resendResponse.status
    );

    console.log(
      "Status Text:",
      resendResponse.statusText
    );

    console.log(
      "Response:",
      resendData
    );

    console.log(
      "================================="
    );

    // ==========================================
    // RESEND ERROR
    // ==========================================

    if (!resendResponse.ok) {

      const resendErrorMessage =
        resendData?.message ||
        resendData?.error ||
        "Resend email failed";

      console.error(
        "❌ RESEND API ERROR:",
        resendErrorMessage
      );

      return res.status(502).json({
        success: false,

        message:
          resendErrorMessage,

        resendStatus:
          resendResponse.status,

        resendError:
          resendData,
      });
    }

    // ==========================================
    // SUCCESS
    // ==========================================

    console.log("");
    console.log(
      "================================="
    );

    console.log(
      "✅ CONTACT EMAIL SENT"
    );

    console.log(
      "Resend Email ID:",
      resendData?.id
    );

    console.log(
      "================================="
    );

    return res.status(200).json({

      success: true,

      message:
        "Message sent successfully",

      id:
        resendData?.id || null,

    });

  } catch (error) {

    // ==========================================
    // GENERAL ERROR
    // ==========================================

    console.error("");
    console.error(
      "================================="
    );

    console.error(
      "❌ CONTACT EMAIL ERROR"
    );

    console.error(
      "================================="
    );

    console.error(
      "Name:",
      error.name
    );

    console.error(
      "Message:",
      error.message
    );

    console.error(
      "Stack:",
      error.stack
    );

    console.error(
      "================================="
    );

    return res.status(500).json({

      success: false,

      message:
        error.message ||
        "Failed to send message",

    });

  }
};

// ==========================================
// EXPORT
// ==========================================

module.exports = {
  sendContactMessage,
};