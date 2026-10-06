const User = require("../models/User");

// ==========================================
// GET PROFILE
// GET /api/profile
// ==========================================

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching profile",
    });
  }
};

// ==========================================
// UPDATE PROFILE
// PUT /api/profile
// ==========================================

const updateProfile = async (req, res) => {
  try {
    const {
      name,
      profession,
      bio,
      skills,
      experience,
      education,
      profileImage,
      resumeUrl,
      github,
      linkedin,
      twitter,
      website,
      socialLinks,
    } = req.body;

    // ==========================================
    // FIND LOGGED-IN USER
    // ==========================================

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ==========================================
    // BASIC INFORMATION
    // ==========================================

    if (name !== undefined) {
      const cleanName = String(name).trim();

      if (!cleanName) {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty",
        });
      }

      user.name = cleanName;
    }

    // ==========================================
    // PROFILE INFORMATION
    // ==========================================

    if (profession !== undefined) {
      user.profession = String(profession).trim();
    }

    if (bio !== undefined) {
      user.bio = String(bio).trim();
    }

    // ==========================================
    // SKILLS
    // ==========================================

    if (skills !== undefined) {
      if (Array.isArray(skills)) {
        user.skills = skills
          .map((skill) => {
            if (typeof skill === "object" && skill !== null) {
              return String(
                skill.name ||
                skill.title ||
                skill.skill ||
                ""
              ).trim();
            }

            return String(skill).trim();
          })
          .filter(Boolean);
      } else {
        user.skills = String(skills)
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean);
      }
    }

    // ==========================================
    // EXPERIENCE
    // ==========================================

    if (experience !== undefined) {
      user.experience = String(experience).trim();
    }

    // ==========================================
    // EDUCATION
    // ==========================================

    if (education !== undefined) {
      user.education = String(education).trim();
    }

    // ==========================================
    // PROFILE IMAGE
    // ==========================================

    if (profileImage !== undefined) {
      user.profileImage = String(profileImage).trim();
    }

    // ==========================================
    // RESUME
    // ==========================================

    if (resumeUrl !== undefined) {
      user.resumeUrl = String(resumeUrl).trim();
    }

    // ==========================================
    // SOCIAL LINKS
    // ==========================================

    if (!user.socialLinks) {
      user.socialLinks = {};
    }

    // Support both:
    // 1. socialLinks: { github, linkedin... }
    // 2. direct github/linkedin/twitter/website

    if (socialLinks && typeof socialLinks === "object") {
      if (socialLinks.github !== undefined) {
        user.socialLinks.github =
          String(socialLinks.github).trim();
      }

      if (socialLinks.linkedin !== undefined) {
        user.socialLinks.linkedin =
          String(socialLinks.linkedin).trim();
      }

      if (socialLinks.twitter !== undefined) {
        user.socialLinks.twitter =
          String(socialLinks.twitter).trim();
      }

      if (socialLinks.website !== undefined) {
        user.socialLinks.website =
          String(socialLinks.website).trim();
      }
    }

    if (github !== undefined) {
      user.socialLinks.github =
        String(github).trim();
    }

    if (linkedin !== undefined) {
      user.socialLinks.linkedin =
        String(linkedin).trim();
    }

    if (twitter !== undefined) {
      user.socialLinks.twitter =
        String(twitter).trim();
    }

    if (website !== undefined) {
      user.socialLinks.website =
        String(website).trim();
    }

    // ==========================================
    // SAVE TO DATABASE
    // ==========================================

    const updatedUser = await user.save();

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        plan: updatedUser.plan,

        profession: updatedUser.profession,
        bio: updatedUser.bio,

        skills: updatedUser.skills,
        experience: updatedUser.experience,
        education: updatedUser.education,

        profileImage: updatedUser.profileImage,
        resumeUrl: updatedUser.resumeUrl,

        socialLinks: updatedUser.socialLinks,
      },
    });

  } catch (error) {
    console.error("Update Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating profile",
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,

};