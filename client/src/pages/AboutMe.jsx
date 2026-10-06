import React, { useEffect, useRef, useState } from "react";

import {
  ArrowLeft,
  User,
  Mail,
  Briefcase,
  GraduationCap,
  Code2,
  Globe,
  Pencil,
  Save,
  ExternalLink,
  X,
  Plus,
  Camera,
  ImagePlus,
  Trash2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import API from "../services/api";

import "./AboutMe.css";

const AboutMe = () => {
  const navigate = useNavigate();

  // =====================================================
  // PROFILE STATE
  // =====================================================

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    profession: "",
    bio: "",

    skills: [],
    skillsInput: "",

    experience: "",
    education: "",

    github: "",
    linkedin: "",
    website: "",
    twitter: "",

    profileImage: "",
    resumeUrl: "",
  });

  // =====================================================
  // UI STATES
  // =====================================================

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // PROFILE PHOTO STATES
  // =====================================================

  const [showPhotoMenu, setShowPhotoMenu] = useState(false);

  const photoInputRef = useRef(null);

  // =====================================================
  // SKILL DISPLAY HELPER
  // =====================================================

  const getSkillName = (skill) => {
    if (typeof skill === "string") {
      return skill.trim();
    }

    if (skill && typeof skill === "object") {
      return (
        skill.name ||
        skill.title ||
        skill.skill ||
        ""
      ).trim();
    }

    return "";
  };

  // =====================================================
  // PROFILE DATA MAPPER
  // =====================================================

  const mapUserToProfile = (user) => {
    return {
      name: user?.name || "",

      email: user?.email || "",

      profession:
        user?.profession ||
        user?.title ||
        "",

      bio: user?.bio || "",

      skills: Array.isArray(user?.skills)
        ? user.skills
        : [],

      skillsInput: "",

      experience:
        user?.experience || "",

      education:
        user?.education || "",

      github:
        user?.socialLinks?.github ||
        user?.github ||
        "",

      linkedin:
        user?.socialLinks?.linkedin ||
        user?.linkedin ||
        "",

      website:
        user?.socialLinks?.website ||
        user?.website ||
        "",

      twitter:
        user?.socialLinks?.twitter ||
        user?.twitter ||
        "",

      profileImage:
        user?.profileImage || "",

      resumeUrl:
        user?.resumeUrl || "",
    };
  };

  // =====================================================
  // LOAD PROFILE
  // =====================================================

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");
        setSuccess("");

        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await API.get("/profile");

        console.log(
          "About Me Profile Response:",
          response.data
        );

        if (!mounted) {
          return;
        }

        const user =
          response.data?.user ||
          response.data?.profile ||
          null;

        if (!user) {
          throw new Error(
            "Profile data not found"
          );
        }

        setProfile(
          mapUserToProfile(user)
        );
      } catch (err) {
        console.error(
          "About Me Profile Error:",
          err
        );

        if (!mounted) {
          return;
        }

        // Unauthorized
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        // Profile API not found
        if (err.response?.status === 404) {
          setError(
            "Profile API not found. Please check the backend /api/profile route."
          );
          return;
        }

        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load profile"
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  // =====================================================
  // NORMAL INPUT CHANGE
  // =====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // =====================================================
  // PROFILE PHOTO
  // =====================================================

  const handlePhotoClick = () => {
    setShowPhotoMenu((previous) => !previous);
  };

  // =====================================================
  // ADD / CHANGE PHOTO
  // =====================================================

  const handleAddPhoto = () => {
    setShowPhotoMenu(false);

    if (photoInputRef.current) {
      photoInputRef.current.click();
    }
  };

  // =====================================================
  // PHOTO FILE CHANGE
  // =====================================================

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // Image validation
    if (!file.type.startsWith("image/")) {
      setError(
        "Please select a valid image file."
      );

      event.target.value = "";
      return;
    }

    // 2 MB limit
    if (file.size > 2 * 1024 * 1024) {
      setError(
        "Profile photo must be less than 2MB."
      );

      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const imageData = reader.result;

      setProfile((previous) => ({
        ...previous,
        profileImage: imageData,
      }));

      setEditing(true);
      setError("");
      setSuccess(
        "Photo selected. Click Save to update your profile."
      );
    };

    reader.onerror = () => {
      setError(
        "Failed to read the selected image."
      );
    };

    reader.readAsDataURL(file);

    event.target.value = "";
  };

  // =====================================================
  // REMOVE PHOTO
  // =====================================================

  const handleRemovePhoto = () => {
    setProfile((previous) => ({
      ...previous,
      profileImage: "",
    }));

    setEditing(true);
    setShowPhotoMenu(false);

    setError("");
    setSuccess(
      "Photo removed. Click Save to update your profile."
    );
  };

  // =====================================================
  // ADD SKILLS
  // =====================================================

  const addSkillsFromText = (text) => {
    const parts = String(text || "")
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    if (parts.length === 0) {
      return;
    }

    setProfile((previous) => {
      const existingSkills = Array.isArray(
        previous.skills
      )
        ? previous.skills
            .map(getSkillName)
            .filter(Boolean)
        : [];

      const mergedSkills = [
        ...existingSkills,
      ];

      parts.forEach((skill) => {
        const alreadyExists =
          mergedSkills.some(
            (existingSkill) =>
              existingSkill.toLowerCase() ===
              skill.toLowerCase()
          );

        if (!alreadyExists) {
          mergedSkills.push(skill);
        }
      });

      return {
        ...previous,
        skills: mergedSkills,
        skillsInput: "",
      };
    });

    setError("");
    setSuccess("");
  };

  // =====================================================
  // SKILLS INPUT CHANGE
  // =====================================================

  const handleSkillsChange = (event) => {
    const value = event.target.value;

    if (value.includes(",")) {
      const parts = value.split(",");

      const completedSkills = parts
        .slice(0, -1)
        .map((skill) => skill.trim())
        .filter(Boolean);

      const remainingText =
        parts[parts.length - 1];

      setProfile((previous) => {
        const existingSkills = Array.isArray(
          previous.skills
        )
          ? previous.skills
              .map(getSkillName)
              .filter(Boolean)
          : [];

        const mergedSkills = [
          ...existingSkills,
        ];

        completedSkills.forEach((skill) => {
          const alreadyExists =
            mergedSkills.some(
              (existingSkill) =>
                existingSkill.toLowerCase() ===
                skill.toLowerCase()
            );

          if (!alreadyExists) {
            mergedSkills.push(skill);
          }
        });

        return {
          ...previous,
          skills: mergedSkills,
          skillsInput: remainingText,
        };
      });
    } else {
      setProfile((previous) => ({
        ...previous,
        skillsInput: value,
      }));
    }

    setError("");
    setSuccess("");
  };

  // =====================================================
  // SKILL KEYBOARD
  // =====================================================

  const handleSkillKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();

      addSkillsFromText(
        profile.skillsInput
      );

      return;
    }

    if (
      event.key === "Backspace" &&
      !profile.skillsInput &&
      profile.skills.length > 0
    ) {
      removeSkill(
        profile.skills.length - 1
      );
    }
  };

  // =====================================================
  // REMOVE SKILL
  // =====================================================

  const removeSkill = (indexToRemove) => {
    setProfile((previous) => ({
      ...previous,

      skills: previous.skills.filter(
        (_, index) =>
          index !== indexToRemove
      ),
    }));

    setError("");
    setSuccess("");
  };

  // =====================================================
  // EDIT PROFILE
  // =====================================================

  const handleEdit = () => {
    setEditing(true);
    setError("");
    setSuccess("");
  };

  // =====================================================
  // CANCEL EDIT
  // =====================================================

  const handleCancel = async () => {
    try {
      setEditing(false);
      setShowPhotoMenu(false);

      setError("");
      setSuccess("");

      const response = await API.get(
        "/profile"
      );

      const user =
        response.data?.user ||
        response.data?.profile ||
        null;

      if (!user) {
        throw new Error(
          "Profile data not found"
        );
      }

      setProfile(
        mapUserToProfile(user)
      );
    } catch (err) {
      console.error(
        "Cancel Profile Error:",
        err
      );

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to reload profile"
      );
    }
  };

  // =====================================================
  // SAVE PROFILE
  // =====================================================

  const handleSave = async () => {
    try {
      setSaving(true);

      setError("");
      setSuccess("");

      // Basic validation
      if (!profile.name.trim()) {
        setError("Name is required.");
        setSaving(false);
        return;
      }

      // Clean skills
      const existingSkills =
        Array.isArray(profile.skills)
          ? profile.skills
              .map((skill) =>
                getSkillName(skill)
              )
              .map((skill) =>
                skill.trim()
              )
              .filter(Boolean)
          : [];

      // Pending skill
      const pendingSkill =
        profile.skillsInput?.trim() || "";

      const allSkills = [
        ...existingSkills,
      ];

      if (pendingSkill) {
        const alreadyExists =
          allSkills.some(
            (skill) =>
              skill.toLowerCase() ===
              pendingSkill.toLowerCase()
          );

        if (!alreadyExists) {
          allSkills.push(
            pendingSkill
          );
        }
      }

      // Remove duplicate skills
      const cleanedSkills =
        allSkills.filter(
          (skill, index, array) =>
            array.findIndex(
              (item) =>
                item.toLowerCase() ===
                skill.toLowerCase()
            ) === index
        );

      // =================================================
      // PROFILE PAYLOAD
      // =================================================

      const payload = {
        name: profile.name.trim(),

        profession:
          profile.profession.trim(),

        bio:
          profile.bio.trim(),

        skills: cleanedSkills,

        experience:
          profile.experience.trim(),

        education:
          profile.education.trim(),

        profileImage:
          profile.profileImage.trim(),

        resumeUrl:
          profile.resumeUrl.trim(),

        socialLinks: {
          github:
            profile.github.trim(),

          linkedin:
            profile.linkedin.trim(),

          twitter:
            profile.twitter.trim(),

          website:
            profile.website.trim(),
        },
      };

      // =================================================
      // UPDATE PROFILE
      // =================================================

      const response = await API.put(
        "/profile",
        payload
      );

      console.log(
        "About Me Update Response:",
        response.data
      );

      // =================================================
      // UPDATED USER
      // =================================================

      const updatedUser =
        response.data?.user ||
        response.data?.profile ||
        null;

      if (updatedUser) {
        setProfile(
          mapUserToProfile(
            updatedUser
          )
        );
      } else {
        setProfile((previous) => ({
          ...previous,

          skills: cleanedSkills,

          skillsInput: "",
        }));
      }

      setEditing(false);
      setShowPhotoMenu(false);

      setSuccess(
        "Profile updated successfully."
      );
    } catch (err) {
      console.error(
        "About Me Save Error:",
        err
      );

      // Unauthorized
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      // Not found
      if (err.response?.status === 404) {
        setError(
          "Profile update API not found. Please check the backend /api/profile route."
        );

        return;
      }

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // LOADING SCREEN
  // =====================================================

  if (loading) {
    return (
      <div className="about-me-page">
        <div className="about-me-container">
          <div className="about-me-loading">
            Loading profile...
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="about-me-page">

      <div className="about-me-container">

        {/* =================================================
            TOP BAR
        ================================================= */}

        <div className="about-me-topbar">

          <button
            type="button"
            className="about-me-back-btn"
            onClick={() => navigate("/")}
          >
            <ArrowLeft size={17} />

            <span>
              Back
            </span>
          </button>

          {!editing ? (
            <button
              type="button"
              className="about-me-edit-btn"
              onClick={handleEdit}
            >
              <Pencil size={16} />

              <span>
                Edit Profile
              </span>
            </button>
          ) : (
            <div className="about-me-edit-actions">

              <button
                type="button"
                className="about-me-cancel-btn"
                onClick={handleCancel}
                disabled={saving}
              >
                <X size={16} />

                <span>
                  Cancel
                </span>
              </button>

              <button
                type="button"
                className="about-me-save-btn"
                onClick={handleSave}
                disabled={saving}
              >
                <Save size={16} />

                <span>
                  {saving
                    ? "Saving..."
                    : "Save"}
                </span>
              </button>

            </div>
          )}

        </div>

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="about-me-header">

          <h1>
            About Me
          </h1>

          <p>
            Manage your professional profile
            and personal information.
          </p>

        </div>

        {/* =================================================
            SUCCESS
        ================================================= */}

        {success && (
          <div className="about-me-success">
            {success}
          </div>
        )}

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="about-me-error">
            {error}
          </div>
        )}

        {/* =================================================
            PROFILE CARD
        ================================================= */}

        <div className="about-me-profile-card">

          {/* =================================================
              PROFILE AVATAR
          ================================================= */}

          <div className="about-me-avatar-wrapper">

            <button
              type="button"
              className="about-me-avatar"
              onClick={handlePhotoClick}
              title="Profile Photo"
            >
              {profile.profileImage ? (
                <img
                  src={profile.profileImage}
                  alt={
                    profile.name ||
                    "Profile"
                  }
                />
              ) : (
                <User size={50} />
              )}
            </button>

            {/* =================================================
                PHOTO MENU
            ================================================= */}

            {showPhotoMenu && (
              <div className="about-me-photo-menu">

                <button
                  type="button"
                  onClick={handleAddPhoto}
                >
                  {profile.profileImage ? (
                    <Camera size={16} />
                  ) : (
                    <ImagePlus size={16} />
                  )}

                  <span>
                    {profile.profileImage
                      ? "Change Photo"
                      : "Add Photo"}
                  </span>
                </button>

                {profile.profileImage && (
                  <button
                    type="button"
                    className="about-me-photo-remove"
                    onClick={
                      handleRemovePhoto
                    }
                  >
                    <Trash2 size={16} />

                    <span>
                      Remove Photo
                    </span>
                  </button>
                )}

              </div>
            )}

            {/* Hidden File Input */}

            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              hidden
            />

          </div>

          {/* =================================================
              PROFILE INFORMATION
          ================================================= */}

          <div className="about-me-profile-info">

            {!editing ? (
              <>
                <h2>
                  {profile.name ||
                    "Your Name"}
                </h2>

                <p>
                  {profile.profession ||
                    "Add your professional title"}
                </p>

                <span>
                  <Mail size={17} />

                  {profile.email ||
                    "No email"}
                </span>
              </>
            ) : (
              <div className="about-me-profile-form">

                {/* NAME */}

                <div className="about-me-field">

                  <label>
                    Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    disabled={saving}
                  />

                </div>

                {/* PROFESSION */}

                <div className="about-me-field">

                  <label>
                    Professional Title
                  </label>

                  <input
                    type="text"
                    name="profession"
                    value={
                      profile.profession
                    }
                    onChange={handleChange}
                    placeholder="e.g. Full Stack Developer"
                    disabled={saving}
                  />

                </div>

                {/* EMAIL */}

                <div className="about-me-field">

                  <label>
                    Email
                  </label>

                  <input
                    type="email"
                    value={profile.email}
                    disabled
                  />

                </div>

              </div>
            )}

          </div>

        </div>

        {/* =================================================
            ABOUT / BIO
        ================================================= */}

        <div className="about-me-card">

          <div className="about-me-card-header">

            <User size={20} />

            <div>
              <h2>
                About Me
              </h2>

              <p>
                Your professional introduction.
              </p>
            </div>

          </div>

          <div className="about-me-content">

            {!editing ? (
              <p className="about-me-bio">
                {profile.bio ||
                  "No professional bio added yet."}
              </p>
            ) : (
              <textarea
                className="about-me-textarea"
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                placeholder="Write something about yourself..."
                rows="6"
                disabled={saving}
              />
            )}

          </div>

        </div>

        {/* =================================================
            SKILLS
        ================================================= */}

        <div className="about-me-card">

          <div className="about-me-card-header">

            <Code2 size={20} />

            <div>
              <h2>
                Skills
              </h2>

              <p>
                Your technical skills and expertise.
              </p>
            </div>

          </div>

          <div className="about-me-content">

            {!editing ? (
              <div className="about-me-skills">

                {profile.skills.length > 0 ? (
                  profile.skills.map(
                    (skill, index) => {
                      const skillName =
                        getSkillName(skill);

                      if (!skillName) {
                        return null;
                      }

                      return (
                        <span
                          key={`${skillName}-${index}`}
                          className="about-me-skill"
                        >
                          {skillName}
                        </span>
                      );
                    }
                  )
                ) : (
                  <p className="about-me-content-text">
                    No skills added yet.
                  </p>
                )}

              </div>
            ) : (
              <div className="about-me-field">

                <label>
                  Skills
                </label>

                {/* Existing Skill Chips */}

                {profile.skills.length > 0 && (
                  <div className="about-me-skills">

                    {profile.skills.map(
                      (skill, index) => {
                        const skillName =
                          getSkillName(skill);

                        if (!skillName) {
                          return null;
                        }

                        return (
                          <span
                            key={`${skillName}-${index}`}
                            className="about-me-skill about-me-editable-skill"
                          >
                            {skillName}

                            <button
                              type="button"
                              className="about-me-skill-remove"
                              onClick={() =>
                                removeSkill(index)
                              }
                              disabled={saving}
                              aria-label={`Remove ${skillName}`}
                            >
                              <X size={13} />
                            </button>
                          </span>
                        );
                      }
                    )}

                  </div>
                )}

                {/* Skill Input */}

                <div className="about-me-skill-input-row">

                  <input
                    type="text"
                    value={
                      profile.skillsInput
                    }
                    onChange={
                      handleSkillsChange
                    }
                    onKeyDown={
                      handleSkillKeyDown
                    }
                    placeholder="React, Node.js, MongoDB"
                    disabled={saving}
                  />

                  <button
                    type="button"
                    className="about-me-skill-add-btn"
                    onClick={() =>
                      addSkillsFromText(
                        profile.skillsInput
                      )
                    }
                    disabled={
                      saving ||
                      !profile.skillsInput.trim()
                    }
                    aria-label="Add skill"
                  >
                    <Plus size={17} />

                    <span>
                      Add
                    </span>
                  </button>

                </div>

                <small>
                  Type a skill and press Enter,
                  comma, or Add button.
                </small>

              </div>
            )}

          </div>

        </div>

        {/* =================================================
            EXPERIENCE + EDUCATION
        ================================================= */}

        <div className="about-me-two-column">

          {/* EXPERIENCE */}

          <div className="about-me-card">

            <div className="about-me-card-header">

              <Briefcase size={20} />

              <div>
                <h2>
                  Experience
                </h2>

                <p>
                  Your professional experience.
                </p>
              </div>

            </div>

            <div className="about-me-content">

              {!editing ? (
                <p className="about-me-content-text">
                  {profile.experience ||
                    "No experience information added yet."}
                </p>
              ) : (
                <textarea
                  className="about-me-textarea"
                  name="experience"
                  value={
                    profile.experience
                  }
                  onChange={handleChange}
                  placeholder={`Example:

Frontend Developer

ABC Company | 2025 - Present

• Developed responsive React applications
• Built REST API integrations
• Worked with MongoDB and Node.js
• Improved website performance`}
                  rows="10"
                  disabled={saving}
                />
              )}

            </div>

          </div>

          {/* EDUCATION */}

          <div className="about-me-card">

            <div className="about-me-card-header">

              <GraduationCap size={20} />

              <div>
                <h2>
                  Education
                </h2>

                <p>
                  Your educational background.
                </p>
              </div>

            </div>

            <div className="about-me-content">

              {!editing ? (
                <p className="about-me-content-text">
                  {profile.education ||
                    "No education information added yet."}
                </p>
              ) : (
                <textarea
                  className="about-me-textarea"
                  name="education"
                  value={
                    profile.education
                  }
                  onChange={handleChange}
                  placeholder={`Example:

Integrated MCA

ABC University

2023 - 2026

Relevant Subjects:
• Web Development
• Database Management
• Software Engineering`}
                  rows="10"
                  disabled={saving}
                />
              )}

            </div>

          </div>

        </div>

        {/* =================================================
            SOCIAL LINKS
        ================================================= */}

        <div className="about-me-card">

          <div className="about-me-card-header">

            <Globe size={20} />

            <div>
              <h2>
                Social Links
              </h2>

              <p>
                Your professional online profiles.
              </p>
            </div>

          </div>

          <div className="about-me-content">

            {!editing ? (
              <div className="about-me-social-links">

                {/* GITHUB */}

                {profile.github && (
                  <a
                    href={profile.github}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink size={17} />

                    <span>
                      GitHub
                    </span>
                  </a>
                )}

                {/* LINKEDIN */}

                {profile.linkedin && (
                  <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink size={17} />

                    <span>
                      LinkedIn
                    </span>
                  </a>
                )}

                {/* WEBSITE */}

                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Globe size={17} />

                    <span>
                      Website
                    </span>
                  </a>
                )}

                {/* TWITTER */}

                {profile.twitter && (
                  <a
                    href={profile.twitter}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink size={17} />

                    <span>
                      Twitter / X
                    </span>
                  </a>
                )}

                {!profile.github &&
                  !profile.linkedin &&
                  !profile.website &&
                  !profile.twitter && (
                    <p className="about-me-content-text">
                      No social links added yet.
                    </p>
                  )}

              </div>
            ) : (
              <div className="about-me-social-form">

                {/* GITHUB */}

                <div className="about-me-field">

                  <label>
                    GitHub
                  </label>

                  <input
                    type="url"
                    name="github"
                    value={profile.github}
                    onChange={handleChange}
                    placeholder="https://github.com/username"
                    disabled={saving}
                  />

                </div>

                {/* LINKEDIN */}

                <div className="about-me-field">

                  <label>
                    LinkedIn
                  </label>

                  <input
                    type="url"
                    name="linkedin"
                    value={
                      profile.linkedin
                    }
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/username"
                    disabled={saving}
                  />

                </div>

                {/* WEBSITE */}

                <div className="about-me-field">

                  <label>
                    Website
                  </label>

                  <input
                    type="url"
                    name="website"
                    value={
                      profile.website
                    }
                    onChange={handleChange}
                    placeholder="https://yourwebsite.com"
                    disabled={saving}
                  />

                </div>

                {/* TWITTER */}

                <div className="about-me-field">

                  <label>
                    Twitter / X
                  </label>

                  <input
                    type="url"
                    name="twitter"
                    value={
                      profile.twitter
                    }
                    onChange={handleChange}
                    placeholder="https://x.com/username"
                    disabled={saving}
                  />

                </div>

              </div>
            )}

          </div>

        </div>

        {/* =================================================
            RESUME
        ================================================= */}

        {profile.resumeUrl && (
          <div className="about-me-card">

            <div className="about-me-card-header">

              <Briefcase size={20} />

              <div>
                <h2>
                  Resume
                </h2>

                <p>
                  Your uploaded professional resume.
                </p>
              </div>

            </div>

            <div className="about-me-content">

              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="about-me-social-link"
              >
                <ExternalLink size={17} />

                View Resume
              </a>

            </div>

          </div>
        )}

      </div>

    </div>
  );
};

export default AboutMe;