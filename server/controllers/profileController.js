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
    // BUILD UPDATE OBJECT
    // ==========================================

    const updateData = {};

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

      updateData.name = cleanName;
    }

    // ==========================================
    // PROFILE INFORMATION
    // ==========================================

    if (profession !== undefined) {
      updateData.profession = String(profession).trim();
    }

    if (bio !== undefined) {
      updateData.bio = String(bio).trim();
    }

    // ==========================================
    // SKILLS
    // ==========================================

    if (skills !== undefined) {
      if (Array.isArray(skills)) {
        updateData.skills = skills
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
        updateData.skills = String(skills)
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean);
      }
    }

    // ==========================================
    // EXPERIENCE
    // ==========================================

    if (experience !== undefined) {
      updateData.experience = String(experience).trim();
    }

    // ==========================================
    // EDUCATION
    // ==========================================

    if (education !== undefined) {
      updateData.education = String(education).trim();
    }

    // ==========================================
    // PROFILE IMAGE
    // ==========================================

    if (profileImage !== undefined) {
      updateData.profileImage = String(profileImage).trim();
    }

    // ==========================================
    // RESUME
    // ==========================================

    if (resumeUrl !== undefined) {
      updateData.resumeUrl = String(resumeUrl).trim();
    }

    // ==========================================
    // SOCIAL LINKS
    // ==========================================

    const existingSocialLinks =
      user.socialLinks &&
      typeof user.socialLinks === "object"
        ? user.socialLinks.toObject
          ? user.socialLinks.toObject()
          : { ...user.socialLinks }
        : {};

    const updatedSocialLinks = {
      ...existingSocialLinks,
    };

    let socialLinksChanged = false;

    // ==========================================
    // SOCIAL LINKS OBJECT
    // ==========================================

    if (
      socialLinks &&
      typeof socialLinks === "object" &&
      !Array.isArray(socialLinks)
    ) {
      if (socialLinks.github !== undefined) {
        updatedSocialLinks.github =
          String(socialLinks.github).trim();

        socialLinksChanged = true;
      }

      if (socialLinks.linkedin !== undefined) {
        updatedSocialLinks.linkedin =
          String(socialLinks.linkedin).trim();

        socialLinksChanged = true;
      }

      if (socialLinks.twitter !== undefined) {
        updatedSocialLinks.twitter =
          String(socialLinks.twitter).trim();

        socialLinksChanged = true;
      }

      if (socialLinks.website !== undefined) {
        updatedSocialLinks.website =
          String(socialLinks.website).trim();

        socialLinksChanged = true;
      }
    }

    // ==========================================
    // DIRECT SOCIAL LINKS
    // ==========================================

    if (github !== undefined) {
      updatedSocialLinks.github =
        String(github).trim();

      socialLinksChanged = true;
    }

    if (linkedin !== undefined) {
      updatedSocialLinks.linkedin =
        String(linkedin).trim();

      socialLinksChanged = true;
    }

    if (twitter !== undefined) {
      updatedSocialLinks.twitter =
        String(twitter).trim();

      socialLinksChanged = true;
    }

    if (website !== undefined) {
      updatedSocialLinks.website =
        String(website).trim();

      socialLinksChanged = true;
    }

    if (socialLinksChanged) {
      updateData.socialLinks = updatedSocialLinks;
    }

    // ==========================================
    // NOTHING TO UPDATE
    // ==========================================

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No profile data provided for update",
      });
    }

    // ==========================================
    // UPDATE DATABASE
    // ==========================================
    // IMPORTANT:
    // Using findByIdAndUpdate instead of user.save()
    // prevents unrelated required-field validation
    // such as missing username from breaking profile updates.
    // ==========================================

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: updateData,
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found after update",
      });
    }

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
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
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  getProfile,
  updateProfile,
};
