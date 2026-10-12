const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/User");
const { sendOTPEmail } = require("../utils/sendEmail");



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



const getUserIdFromRequest = (req) => {
  return (
    req.user?.id ||
    req.user?._id ||
    req.user?.userId ||
    null
  );
};



const register = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
    } = req.body || {};

   

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

    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      12
    );

   

    const user = await User.create({
      username: cleanUsername,
      email: cleanEmail,
      password: hashedPassword,
    });

 

    const token = generateToken(user);

    console.log(
      `✅ User registered successfully: ${user._id}`
    );

   

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



const login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body || {};

  

    const cleanEmail = String(email || "")
      .trim()
      .toLowerCase();

    if (!cleanEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    

    const user = await User.findOne({
      email: cleanEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

  

    if (!user.password) {
      return res.status(401).json({
        success: false,
        message:
          "Password login is not available for this account.",
      });
    }

  

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

 

    const token = generateToken(user);

    console.log(
      `✅ User logged in successfully: ${user._id}`
    );

   

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



const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body || {};

    const cleanEmail = String(email || "")
      .trim()
      .toLowerCase();

    

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
        message:
          "Please enter a valid email address.",
      });
    }


    const user = await User.findOne({
      email: cleanEmail,
    });

  

    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account exists with this email, an OTP has been sent.",
      });
    }

  

    const otp = crypto
      .randomInt(100000, 1000000)
      .toString();

   

    const otpExpires = new Date(
      Date.now() + 10 * 60 * 1000
    );


    const updateFields = {
      resetPasswordOTP: otp,
      resetPasswordOTPExpires: otpExpires,
    };

    // Optional fields only if they exist in schema
    if (
      Object.prototype.hasOwnProperty.call(
        user.toObject(),
        "resetPasswordOTPAttempts"
      )
    ) {
      updateFields.resetPasswordOTPAttempts = 0;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        user.toObject(),
        "resetPasswordVerified"
      )
    ) {
      updateFields.resetPasswordVerified = false;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        user.toObject(),
        "resetPasswordToken"
      )
    ) {
      updateFields.resetPasswordToken = null;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        user.toObject(),
        "resetPasswordTokenExpires"
      )
    ) {
      updateFields.resetPasswordTokenExpires = null;
    }

    await User.updateOne(
      {
        _id: user._id,
      },
      {
        $set: updateFields,
      }
    );

 

    await sendOTPEmail(
      cleanEmail,
      user.username || "User",
      otp
    );

    console.log(
      `✅ Password reset OTP sent to ${cleanEmail}`
    );


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
        message: "OTP must be 6 digits.",
      });
    }


    const user = await User.findOne({
      email: cleanEmail,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

  

    if (
      !user.resetPasswordOTP ||
      user.resetPasswordOTP !== cleanOTP
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }



    if (
      !user.resetPasswordOTPExpires ||
      new Date(
        user.resetPasswordOTPExpires
      ) < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "OTP has expired. Please request a new OTP.",
      });
    }

   

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
        message: "OTP must be 6 digits.",
      });
    }

    if (finalPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be at least 6 characters.",
      });
    }

  

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

    

    if (
      !user.resetPasswordOTP ||
      user.resetPasswordOTP !== cleanOTP
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }


    if (
      !user.resetPasswordOTPExpires ||
      new Date(
        user.resetPasswordOTPExpires
      ) < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "OTP has expired. Please request a new OTP.",
      });
    }



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

  

    const hashedPassword =
      await bcrypt.hash(
        finalPassword,
        12
      );

    

    user.password = hashedPassword;



    user.resetPasswordOTP = undefined;

    user.resetPasswordOTPExpires =
      undefined;

    // Optional security cleanup
    if ("resetPasswordOTPAttempts" in user) {
      user.resetPasswordOTPAttempts = 0;
    }

    if ("resetPasswordVerified" in user) {
      user.resetPasswordVerified = false;
    }

    if ("resetPasswordToken" in user) {
      user.resetPasswordToken = undefined;
    }

    if ("resetPasswordTokenExpires" in user) {
      user.resetPasswordTokenExpires =
        undefined;
    }

   

    await user.save();

    console.log(
      `✅ Password reset successfully for user: ${user._id}`
    );

  

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


const changePassword = async (req, res) => {
  try {
    const {
      currentPassword,
      newPassword,
    } = req.body || {};

  

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



    let userId =
      getUserIdFromRequest(req);

  

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


    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "User authentication failed.",
      });
    }

   

    const user =
      await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

  

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message:
          "Password authentication is not available for this account.",
      });
    }

 

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

  

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        12
      );

   

    user.password =
      hashedPassword;

    await user.save();

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


const deleteAccount = async (req, res) => {
  try {
    
    let userId =
      getUserIdFromRequest(req);

  

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


    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "User authentication failed.",
      });
    }

  

    const user =
      await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

   

    await User.findByIdAndDelete(userId);

    console.log(
      `✅ Account deleted successfully: ${userId}`
    );

 

    return res.status(200).json({
      success: true,
      message:
        "Account deleted successfully.",
    });

  } catch (error) {
    console.error(
      "❌ Delete Account Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete account. Please try again.",
    });
  }
};



module.exports = {
  register,
  login,
  forgotPassword,
  verifyOTP,
  resetPassword,
  changePassword,
  deleteAccount,
};
