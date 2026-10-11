const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/User");
const { sendOTPEmail } = require("../utils/sendEmail");

// ============================================================
// HELPER - GENERATE JWT
// ============================================================

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      userId: user._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
};

// ============================================================
// HELPER - GET USER ID
// ============================================================

const getUserIdFromRequest = (req) => {
  return (
    req.user?.id ||
    req.user?._id ||
    req.user?.userId ||
    null
  );
};

// ============================================================
// REGISTER
// POST /api/auth/register
// ============================================================

const register = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
    } = req.body || {};

    // ----------------------------------------------------------
    // VALIDATION
    // ----------------------------------------------------------

    const cleanUsername = String(username || "").trim();

    const cleanEmail = String(email || "")
      .trim()
      .toLowerCase();

    if (!cleanUsername || !cleanEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, email and password are required.",
      });
    }

    if (cleanUsername.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Username must be at least 2 characters.",
      });
    }

    // Correct email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    // ----------------------------------------------------------
    // CHECK EXISTING USER
    // ----------------------------------------------------------

    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // ----------------------------------------------------------
    // HASH PASSWORD
    // ----------------------------------------------------------

    const hashedPassword = await bcrypt.hash(
      password,
      12
    );

    // ----------------------------------------------------------
    // CREATE USER
    // ----------------------------------------------------------

    const user = await User.create({
      username: cleanUsername,
      email: cleanEmail,
      password: hashedPassword,
    });

    // ----------------------------------------------------------
    // GENERATE JWT
    // ----------------------------------------------------------

    const token = generateToken(user);

    console.log(
      `✅ User registered successfully: ${user._id}`
    );

    // ----------------------------------------------------------
    // RESPONSE
    // ----------------------------------------------------------

    return res.status(201).json({
      success: true,
      message: "Registration successful.",
      token,
      user: {
        id: user._id,
        _id: user._id,
        username: user.username,
        email: user.email,
      },
    });

  } catch (error) {
    console.error(
      "❌ Register Error:",
      error
    );

    // MongoDB duplicate email
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
    });
  }
};

// ============================================================
// LOGIN
// POST /api/auth/login
// ============================================================

const login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body || {};

    // ----------------------------------------------------------
    // VALIDATION
    // ----------------------------------------------------------

    const cleanEmail = String(email || "")
      .trim()
      .toLowerCase();

    if (!cleanEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // ----------------------------------------------------------
    // FIND USER
    // ----------------------------------------------------------

    const user = await User.findOne({
      email: cleanEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // ----------------------------------------------------------
    // CHECK PASSWORD EXISTS
    // ----------------------------------------------------------

    if (!user.password) {
      return res.status(401).json({
        success: false,
        message:
          "Password login is not available for this account.",
      });
    }

    // ----------------------------------------------------------
    // CHECK PASSWORD
    // ----------------------------------------------------------

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // ----------------------------------------------------------
    // GENERATE JWT
    // ----------------------------------------------------------

    const token = generateToken(user);

    console.log(
      `✅ User logged in successfully: ${user._id}`
    );

    // ----------------------------------------------------------
    // LOGIN SUCCESS
    // ----------------------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        _id: user._id,
        username: user.username || "User",
        email: user.email,
      },
    });

  } catch (error) {
    console.error(
      "❌ Login Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  }
};

// ============================================================
// FORGOT PASSWORD
// POST /api/auth/forgot-password
// ============================================================

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body || {};

    const cleanEmail = String(email || "")
      .trim()
      .toLowerCase();

    // ----------------------------------------------------------
    // VALIDATION
    // ----------------------------------------------------------

    if (!cleanEmail) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    // ----------------------------------------------------------
    // FIND USER
    // ----------------------------------------------------------

    const user = await User.findOne({
      email: cleanEmail,
    });

    // ----------------------------------------------------------
    // SECURITY
    // Don't reveal whether email exists
    // ----------------------------------------------------------

    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account exists with this email, an OTP has been sent.",
      });
    }

    // ----------------------------------------------------------
    // GENERATE 6 DIGIT OTP
    // ----------------------------------------------------------

    const otp = crypto
      .randomInt(100000, 1000000)
      .toString();

    // ----------------------------------------------------------
    // OTP EXPIRES IN 10 MINUTES
    // ----------------------------------------------------------

    const otpExpires = new Date(
      Date.now() + 10 * 60 * 1000
    );

    // ----------------------------------------------------------
    // SAVE OTP
    //
    // IMPORTANT:
    // Use updateOne instead of user.save().
    //
    // This prevents validation errors for old users
    // whose username may be missing.
    // ----------------------------------------------------------

    await User.updateOne(
      {
        _id: user._id,
      },
      {
        $set: {
          resetPasswordOTP: otp,
          resetPasswordOTPExpires: otpExpires,
          resetPasswordOTPAttempts: 0,
          resetPasswordVerified: false,
          resetPasswordToken: null,
          resetPasswordTokenExpires: null,
        },
      }
    );

    console.log(
      "=========================================="
    );
    console.log("🔐 PASSWORD RESET OTP");
    console.log("Email:", cleanEmail);
    console.log("OTP:", otp);
    console.log("Expires:", otpExpires);
    console.log(
      "=========================================="
    );

    // ----------------------------------------------------------
    // SEND OTP EMAIL THROUGH RESEND
    // ----------------------------------------------------------

    await sendOTPEmail(
      cleanEmail,
      user.username || "User",
      otp
    );

    console.log(
      `✅ Password reset OTP sent to ${cleanEmail}`
    );

    // ----------------------------------------------------------
    // RESPONSE
    // ----------------------------------------------------------

    return res.status(200).json({
      success: true,
      message:
        "OTP sent successfully. Please check your email.",
    });

  } catch (error) {
    console.error(
      "❌ Forgot Password Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to send OTP. Please try again later.",
    });
  }
};

// ============================================================
// VERIFY OTP
// POST /api/auth/verify-otp
// ============================================================

const verifyOTP = async (req, res) => {
  try {
    const {
      email,
      otp,
    } = req.body || {};

    const cleanEmail = String(email || "")
      .trim()
      .toLowerCase();

    const cleanOTP = String(otp || "")
      .trim();

    // ----------------------------------------------------------
    // VALIDATION
    // ----------------------------------------------------------

    if (!cleanEmail || !cleanOTP) {
      return res.status(400).json({
        success: false,
        message:
          "Email and OTP are required.",
      });
    }

    if (!/^\d{6}$/.test(cleanOTP)) {
      return res.status(400).json({
        success: false,
        message:
          "OTP must be a 6-digit number.",
      });
    }

    // ----------------------------------------------------------
    // FIND USER
    // ----------------------------------------------------------

    const user = await User.findOne({
      email: cleanEmail,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    // ----------------------------------------------------------
    // DEBUG INFORMATION
    // ----------------------------------------------------------

    console.log(
      "=========================================="
    );
    console.log("🔍 OTP VERIFICATION");
    console.log("Email:", cleanEmail);
    console.log("Entered OTP:", cleanOTP);
    console.log(
      "Database OTP:",
      user.resetPasswordOTP
    );
    console.log(
      "OTP Expires:",
      user.resetPasswordOTPExpires
    );
    console.log(
      "Current Time:",
      new Date()
    );
    console.log(
      "=========================================="
    );

    // ----------------------------------------------------------
    // CHECK OTP EXISTS
    // ----------------------------------------------------------

    if (!user.resetPasswordOTP) {
      return res.status(400).json({
        success: false,
        message:
          "No OTP found. Please request a new OTP.",
      });
    }

    // ----------------------------------------------------------
    // CHECK EXPIRY EXISTS
    // ----------------------------------------------------------

    if (!user.resetPasswordOTPExpires) {
      return res.status(400).json({
        success: false,
        message:
          "OTP expiry information is missing. Please request a new OTP.",
      });
    }

    // ----------------------------------------------------------
    // CHECK EXPIRY
    // ----------------------------------------------------------

    const expiryTime = new Date(
      user.resetPasswordOTPExpires
    ).getTime();

    if (
      Number.isNaN(expiryTime) ||
      expiryTime <= Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "OTP has expired. Please request a new OTP.",
      });
    }

    // ----------------------------------------------------------
    // CHECK OTP
    // ----------------------------------------------------------

    const savedOTP = String(
      user.resetPasswordOTP
    ).trim();

    if (savedOTP !== cleanOTP) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid OTP. Please enter the correct OTP.",
      });
    }

    // ----------------------------------------------------------
    // OTP VERIFIED
    // ----------------------------------------------------------

    await User.updateOne(
      {
        _id: user._id,
      },
      {
        $set: {
          resetPasswordVerified: true,
        },
      }
    );

    console.log(
      `✅ OTP verified successfully for ${cleanEmail}`
    );

    return res.status(200).json({
      success: true,
      message:
        "OTP verified successfully.",
    });

  } catch (error) {
    console.error(
      "❌ Verify OTP Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to verify OTP. Please try again.",
    });
  }
};

// ============================================================
// RESET PASSWORD
// POST /api/auth/reset-password
// ============================================================

const resetPassword = async (req, res) => {
  try {
    const {
      email,
      otp,
      newPassword,
      password,
    } = req.body || {};

    const cleanEmail = String(email || "")
      .trim()
      .toLowerCase();

    const cleanOTP = String(otp || "")
      .trim();

    // Support both newPassword and password
    const finalPassword =
      newPassword || password;

    // ----------------------------------------------------------
    // VALIDATION
    // ----------------------------------------------------------

    if (
      !cleanEmail ||
      !cleanOTP ||
      !finalPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Email, OTP and new password are required.",
      });
    }

    if (!/^\d{6}$/.test(cleanOTP)) {
      return res.status(400).json({
        success: false,
        message:
          "OTP must be 6 digits.",
      });
    }

    if (finalPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be at least 6 characters.",
      });
    }

    // ----------------------------------------------------------
    // FIND USER
    // ----------------------------------------------------------

    const user = await User.findOne({
      email: cleanEmail,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid reset request.",
      });
    }

    // ----------------------------------------------------------
    // CHECK OTP
    // ----------------------------------------------------------

    if (
      !user.resetPasswordOTP ||
      String(user.resetPasswordOTP).trim() !==
        cleanOTP
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid or expired OTP.",
      });
    }

    // ----------------------------------------------------------
    // CHECK OTP EXPIRY
    // ----------------------------------------------------------

    if (
      !user.resetPasswordOTPExpires ||
      new Date(
        user.resetPasswordOTPExpires
      ).getTime() <= Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid or expired OTP.",
      });
    }

    // ----------------------------------------------------------
    // CHECK OTP VERIFIED
    // ----------------------------------------------------------

    if (
      user.resetPasswordVerified !== true
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please verify the OTP first.",
      });
    }

    // ----------------------------------------------------------
    // CHECK OLD PASSWORD
    // ----------------------------------------------------------

    if (user.password) {
      const samePassword =
        await bcrypt.compare(
          finalPassword,
          user.password
        );

      if (samePassword) {
        return res.status(400).json({
          success: false,
          message:
            "New password must be different from your old password.",
        });
      }
    }

    // ----------------------------------------------------------
    // HASH NEW PASSWORD
    // ----------------------------------------------------------

    const hashedPassword =
      await bcrypt.hash(
        finalPassword,
        12
      );

    // ----------------------------------------------------------
    // UPDATE PASSWORD
    //
    // Use updateOne instead of user.save()
    // to avoid username validation problems.
    // ----------------------------------------------------------

    const updateResult =
      await User.updateOne(
        {
          _id: user._id,
        },
        {
          $set: {
            password: hashedPassword,
            resetPasswordVerified: false,
            resetPasswordOTPAttempts: 0,
          },

          $unset: {
            resetPasswordOTP: 1,
            resetPasswordOTPExpires: 1,
            resetPasswordToken: 1,
            resetPasswordTokenExpires: 1,
          },
        }
      );

    if (
      updateResult.matchedCount === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Unable to reset password.",
      });
    }

    console.log(
      `✅ Password reset successfully for user: ${user._id}`
    );

    // ----------------------------------------------------------
    // RESPONSE
    // ----------------------------------------------------------

    return res.status(200).json({
      success: true,
      message:
        "Password reset successfully. You can now login with your new password.",
    });

  } catch (error) {
    console.error(
      "❌ Reset Password Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to reset password. Please try again.",
    });
  }
};

// ============================================================
// CHANGE PASSWORD - LOGGED IN USER
// PUT /api/auth/change-password
// ============================================================

const changePassword = async (req, res) => {
  try {
    const {
      currentPassword,
      newPassword,
    } = req.body || {};

    // ----------------------------------------------------------
    // BASIC VALIDATION
    // ----------------------------------------------------------

    if (
      !currentPassword ||
      !newPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Current password and new password are required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be at least 6 characters.",
      });
    }

    if (
      currentPassword === newPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be different from current password.",
      });
    }

    // ----------------------------------------------------------
    // GET USER ID FROM AUTH MIDDLEWARE
    // ----------------------------------------------------------

    let userId =
      getUserIdFromRequest(req);

    // ----------------------------------------------------------
    // FALLBACK JWT VERIFICATION
    // ----------------------------------------------------------

    if (!userId) {
      const authHeader =
        req.headers.authorization;

      if (
        !authHeader ||
        !authHeader.startsWith(
          "Bearer "
        )
      ) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required.",
        });
      }

      const token =
        authHeader.split(" ")[1];

      try {
        const decoded =
          jwt.verify(
            token,
            process.env.JWT_SECRET
          );

        userId =
          decoded.id ||
          decoded._id ||
          decoded.userId;

      } catch (tokenError) {
        console.error(
          "❌ JWT Verification Error:",
          tokenError.message
        );

        return res.status(401).json({
          success: false,
          message:
            "Invalid or expired authentication token.",
        });
      }
    }

    // ----------------------------------------------------------
    // FINAL USER ID CHECK
    // ----------------------------------------------------------

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "User authentication failed.",
      });
    }

    // ----------------------------------------------------------
    // FIND USER
    // ----------------------------------------------------------

    const user =
      await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // ----------------------------------------------------------
    // CHECK PASSWORD
    // ----------------------------------------------------------

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message:
          "Password authentication is not available for this account.",
      });
    }

    // ----------------------------------------------------------
    // CHECK CURRENT PASSWORD
    // ----------------------------------------------------------

    const passwordMatches =
      await bcrypt.compare(
        currentPassword,
        user.password
      );

    if (!passwordMatches) {
      return res.status(400).json({
        success: false,
        message:
          "Current password is incorrect.",
      });
    }

    // ----------------------------------------------------------
    // HASH NEW PASSWORD
    // ----------------------------------------------------------

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        12
      );

    // ----------------------------------------------------------
    // UPDATE PASSWORD
    //
    // Use updateOne instead of user.save()
    // to avoid validation problems.
    // ----------------------------------------------------------

    await User.updateOne(
      {
        _id: user._id,
      },
      {
        $set: {
          password: hashedPassword,
        },
      }
    );

    console.log(
      `✅ Password changed successfully for user: ${user._id}`
    );

    return res.status(200).json({
      success: true,
      message:
        "Password changed successfully.",
    });

  } catch (error) {
    console.error(
      "❌ Change Password Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to change password.",
    });
  }
};

// ============================================================
// EXPORT ALL AUTH CONTROLLERS
// ============================================================

module.exports = {
  register,
  login,
  forgotPassword,
  verifyOTP,
  resetPassword,
  changePassword,
};
