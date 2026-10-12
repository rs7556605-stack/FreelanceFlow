const User = require("../models/User");

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
      user: {
        id: user._id,
        _id: user._id,
        username: user.username || user.name || "",
        name: user.name || user.username || "",
        email: user.email,
        plan: user.plan,

        profession: user.profession,
        bio: user.bio,

        skills: user.skills,
        experience: user.experience,
        education: user.education,

        profileImage: user.profileImage,
        resumeUrl: user.resumeUrl,

        socialLinks: user.socialLinks,
      },
    });
  } catch (error) {
    console.error("Get Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching profile",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const {
      username,
      name,
      email,
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

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const profileUsername =
      username !== undefined
        ? String(username).trim()
        : name !== undefined
        ? String(name).trim()
        : undefined;

    if (profileUsername !== undefined) {
      if (!profileUsername) {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty",
        });
      }

      user.username = profileUsername;
    }

    if (email !== undefined) {
      const cleanEmail = String(email)
        .trim()
        .toLowerCase();

      if (!cleanEmail) {
        return res.status(400).json({
          success: false,
          message: "Email cannot be empty",
        });
      }

      user.email = cleanEmail;
    }

    if (profession !== undefined) {
      user.profession = String(profession).trim();
    }

    if (bio !== undefined) {
      user.bio = String(bio).trim();
    }

    if (skills !== undefined) {
      if (Array.isArray(skills)) {
        user.skills = skills
          .map((skill) => {
            if (
              typeof skill === "object" &&
              skill !== null
            ) {
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

    if (experience !== undefined) {
      user.experience = String(experience).trim();
    }

    if (education !== undefined) {
      user.education = String(education).trim();
    }

    if (profileImage !== undefined) {
      user.profileImage =
        String(profileImage).trim();
    }

    if (resumeUrl !== undefined) {
      user.resumeUrl =
        String(resumeUrl).trim();
    }

    if (!user.socialLinks) {
      user.socialLinks = {};
    }

    if (
      socialLinks &&
      typeof socialLinks === "object"
    ) {
      if (socialLinks.github !== undefined) {
        user.socialLinks.github =
          String(
            socialLinks.github
          ).trim();
      }

      if (
        socialLinks.linkedin !== undefined
      ) {
        user.socialLinks.linkedin =
          String(
            socialLinks.linkedin
          ).trim();
      }

      if (socialLinks.twitter !== undefined) {
        user.socialLinks.twitter =
          String(
            socialLinks.twitter
          ).trim();
      }

      if (socialLinks.website !== undefined) {
        user.socialLinks.website =
          String(
            socialLinks.website
          ).trim();
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

    const updatedUser = await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        _id: updatedUser._id,

        username:
          updatedUser.username ||
          updatedUser.name ||
          "",

        name:
          updatedUser.username ||
          updatedUser.name ||
          "",

        email: updatedUser.email,
        plan: updatedUser.plan,

        profession:
          updatedUser.profession,

        bio: updatedUser.bio,

        skills:
          updatedUser.skills,

        experience:
          updatedUser.experience,

        education:
          updatedUser.education,

        profileImage:
          updatedUser.profileImage,

        resumeUrl:
          updatedUser.resumeUrl,

        socialLinks:
          updatedUser.socialLinks,
      },
    });
  } catch (error) {
    console.error(
      "Update Profile Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while updating profile",
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
