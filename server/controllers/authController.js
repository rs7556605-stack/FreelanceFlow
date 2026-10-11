const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const changePassword = async (req, res) => {
  try {
    // ==========================================
    // GET REQUEST DATA
    // ==========================================

    const {
      currentPassword,
      newPassword,
    } = req.body || {};

    // ==========================================
    // BASIC VALIDATION
    // ==========================================

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

    // ==========================================
    // PASSWORD LENGTH
    // ==========================================

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be at least 6 characters.",
      });
    }

    // ==========================================
    // PASSWORD DIFFERENCE
    // ==========================================

    if (
      currentPassword === newPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be different from current password.",
      });
    }

    // ==========================================
    // GET USER ID FROM AUTH MIDDLEWARE
    // ==========================================

    let userId =
      req.user?.id ||
      req.user?._id ||
      req.user?.userId;

    // ==========================================
    // FALLBACK JWT VERIFICATION
    // ==========================================

    if (!userId) {
      const authHeader =
        req.headers.authorization;

      if (
        !authHeader ||
        !authHeader.startsWith("Bearer ")
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

    // ==========================================
    // FINAL USER ID CHECK
    // ==========================================

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "User authentication failed.",
      });
    }

    // ==========================================
    // FIND USER
    // ==========================================

    const user =
      await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found.",
      });
    }

    // ==========================================
    // CHECK PASSWORD FIELD
    // ==========================================

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message:
          "Password authentication is not available for this account.",
      });
    }

    // ==========================================
    // CHECK CURRENT PASSWORD
    // ==========================================

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

    // ==========================================
    // HASH NEW PASSWORD
    // ==========================================

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        12
      );

    // ==========================================
    // UPDATE PASSWORD
    // ==========================================

    user.password =
      hashedPassword;

    await user.save();

    // ==========================================
    // SUCCESS
    // ==========================================

    console.log(
      `✅ Password changed successfully for user: ${user._id}`
    );

    return res.status(200).json({
      success: true,
      message:
        "Password changed successfully.",
    });

  } catch (error) {

    // ==========================================
    // SERVER ERROR
    // ==========================================

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

module.exports = {
  changePassword,
};