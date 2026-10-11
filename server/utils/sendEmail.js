const sendOTPEmail = async (email, username, otp) => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is missing");
  }

  if (!process.env.RESEND_FROM_EMAIL) {
    throw new Error("RESEND_FROM_EMAIL is missing");
  }

  if (!email || !otp) {
    throw new Error("Email and OTP are required");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",

    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },

    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL,

      to: [email],

      subject: "Your FreelanceFlow Password Reset OTP",

      text: `Hello ${username || "User"},

Your FreelanceFlow password reset OTP is:

${otp}

This OTP will expire in 10 minutes.

If you did not request a password reset, please ignore this email.

Regards,
FreelanceFlow`,
      
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px;">
          <h2>FreelanceFlow Password Reset</h2>

          <p>Hello ${username || "User"},</p>

          <p>Your password reset OTP is:</p>

          <div style="font-size:32px;font-weight:bold;letter-spacing:8px;padding:20px 0;">
            ${otp}
          </div>

          <p>This OTP will expire in <strong>10 minutes</strong>.</p>

          <p>If you did not request a password reset, please ignore this email.</p>

          <p>Regards,<br />FreelanceFlow</p>
        </div>
      `,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Resend API Error:", data);

    throw new Error(
      data?.message ||
      data?.error ||
      "Failed to send OTP email"
    );
  }

  console.log("OTP email sent successfully:", data);

  return data;
};

module.exports = {
  sendOTPEmail,
};