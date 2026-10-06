const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
} = require("../controllers/clientController");

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/clients
router.get("/", getClients);

// GET /api/clients/:id
router.get("/:id", getClient);

// POST /api/clients
router.post("/", createClient);

// PUT /api/clients/:id
router.put("/:id", updateClient);

// DELETE /api/clients/:id
router.delete("/:id", deleteClient);

module.exports = router;