const nodemailer = require("nodemailer");
const dns = require("dns");

// ==========================================
// PREFER IPV4
// ==========================================

dns.setDefaultResultOrder("ipv4first");

// ==========================================
// GMAIL SMTP TRANSPORTER
// ==========================================

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },

  // Render / IPv6 connection issue ke liye
  family: 4,
});

// ==========================================
// SEND CONTACT MESSAGE
// ==========================================

const sendContactMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // ==========================================
    // CHECK EMAIL CONFIGURATION
    // ==========================================

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("Email credentials are missing");

      return res.status(500).json({
        success: false,
        message: "Email service is not configured",
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

    if (!cleanName || !cleanEmail || !cleanMessage) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // ==========================================
    // EMAIL VALIDATION
    // ==========================================

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    // ==========================================
    // LENGTH VALIDATION
    // ==========================================

    if (cleanName.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Name is too long",
      });
    }

    if (cleanMessage.length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Message is too long",
      });
    }

    // ==========================================
    // EMAIL OPTIONS
    // ==========================================

    const mailOptions = {
      from: `"FreelanceFlow Contact" <${process.env.EMAIL_USER}>`,

      to:
        process.env.CONTACT_TEST_EMAIL ||
        process.env.EMAIL_USER,

      replyTo: cleanEmail,

      subject: `New Contact Message from ${cleanName}`,

      text: `
New Contact Message

Name: ${cleanName}
Email: ${cleanEmail}

Message:
${cleanMessage}
      `,

      html: `
        <div
          style="
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #111827;
          "
        >

          <h2>New Contact Message</h2>

          <p>
            You received a new message from your FreelanceFlow contact form.
          </p>

          <hr />

          <p>
            <strong>Name:</strong> ${cleanName}
          </p>

          <p>
            <strong>Email:</strong> ${cleanEmail}
          </p>

          <p>
            <strong>Message:</strong>
          </p>

          <div
            style="
              padding: 15px;
              background: #f3f4f6;
              border-radius: 8px;
              white-space: pre-wrap;
            "
          >
            ${cleanMessage}
          </div>

        </div>
      `,
    };

    // ==========================================
    // SEND EMAIL
    // ==========================================

    const info = await transporter.sendMail(mailOptions);

    console.log("Contact email sent successfully ✅");
    console.log("Message ID:", info.messageId);

    return res.status(200).json({
      success: true,
      message: "Message sent successfully",
    });

  } catch (error) {
    console.error("Contact Email Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
};

// ==========================================
// EXPORT
// ==========================================

module.exports = {
  sendContactMessage,
};