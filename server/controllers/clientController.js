const Client = require("../models/Client");
const User = require("../models/User");

// =====================================================
// GET ALL CLIENTS
// =====================================================

const getClients = async (req, res) => {
  try {
    const clients =
      await Client.find({
        user: req.user.id,
      }).sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: clients.length,
      clients,
    });
  } catch (error) {
    console.error(
      "Get Clients Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch clients",
    });
  }
};

// =====================================================
// GET SINGLE CLIENT
// =====================================================

const getClient = async (req, res) => {
  try {
    const client =
      await Client.findOne({
        _id: req.params.id,
        user: req.user.id,
      });

    if (!client) {
      return res.status(404).json({
        success: false,
        message:
          "Client not found",
      });
    }

    return res.status(200).json({
      success: true,
      client,
    });
  } catch (error) {
    console.error(
      "Get Client Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch client",
    });
  }
};

// =====================================================
// CREATE CLIENT
// =====================================================

const createClient = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      defaultHourlyRate,
      address,
    } = req.body;

    // =================================================
    // VALIDATION
    // =================================================

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Client name is required",
      });
    }

    // =================================================
    // GET CURRENT USER
    // =================================================

    const user =
      await User.findById(
        req.user.id
      ).select("plan");

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found",
      });
    }

    // =================================================
    // CURRENT CLIENT COUNT
    // =================================================

    const clientCount =
      await Client.countDocuments({
        user: req.user.id,
      });

    // =================================================
    // FREE PLAN LIMIT
    // =================================================

    if (
      user.plan === "Free" &&
      clientCount >= 2
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Free plan allows maximum 2 clients. Upgrade to Pro for unlimited clients.",
      });
    }

    // =================================================
    // CREATE CLIENT
    // =================================================

    const client =
      await Client.create({
        user: req.user.id,

        name: String(name).trim(),

        email:
          email !== undefined
            ? String(email).trim()
            : "",

        phone:
          phone !== undefined
            ? String(phone).trim()
            : "",

        company:
          company !== undefined
            ? String(company).trim()
            : "",

        defaultHourlyRate:
          Number(
            defaultHourlyRate
          ) || 0,

        address:
          address !== undefined
            ? String(address).trim()
            : "",
      });

    return res.status(201).json({
      success: true,
      message:
        "Client created successfully",
      client,
    });
  } catch (error) {
    console.error(
      "Create Client Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create client",
    });
  }
};

// =====================================================
// UPDATE CLIENT
// =====================================================

const updateClient = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      defaultHourlyRate,
      address,
    } = req.body;

    const client =
      await Client.findOne({
        _id: req.params.id,
        user: req.user.id,
      });

    if (!client) {
      return res.status(404).json({
        success: false,
        message:
          "Client not found",
      });
    }

    if (name !== undefined) {
      client.name =
        String(name).trim();
    }

    if (email !== undefined) {
      client.email =
        String(email).trim();
    }

    if (phone !== undefined) {
      client.phone =
        String(phone).trim();
    }

    if (company !== undefined) {
      client.company =
        String(company).trim();
    }

    if (
      defaultHourlyRate !==
      undefined
    ) {
      client.defaultHourlyRate =
        Number(
          defaultHourlyRate
        ) || 0;
    }

    if (address !== undefined) {
      client.address =
        String(address).trim();
    }

    await client.save();

    return res.status(200).json({
      success: true,
      message:
        "Client updated successfully",
      client,
    });
  } catch (error) {
    console.error(
      "Update Client Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update client",
    });
  }
};

// =====================================================
// DELETE CLIENT
// =====================================================

const deleteClient = async (req, res) => {
  try {
    const client =
      await Client.findOneAndDelete({
        _id: req.params.id,
        user: req.user.id,
      });

    if (!client) {
      return res.status(404).json({
        success: false,
        message:
          "Client not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Client deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Client Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete client",
    });
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
};