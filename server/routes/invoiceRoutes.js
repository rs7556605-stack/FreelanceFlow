const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");


const {
  getInvoices,
  getInvoice,
  getUnbilledTimeLogs,
  createInvoice,
  updateInvoice,
  deleteInvoice,
   downloadInvoicePDF,
} = require("../controllers/invoiceController");

const router = express.Router();

router.use(authMiddleware);

// GET ALL
router.get(
  "/",
  getInvoices
);

// IMPORTANT:
// /unbilled/:clientId must come
// before /:id
router.get(
  "/unbilled/:clientId",
  getUnbilledTimeLogs
);

router.get("/:id/pdf", downloadInvoicePDF);
// GET SINGLE
router.get(
  "/:id",
  getInvoice
);

// CREATE
router.post(
  "/",
  createInvoice
);

// UPDATE
router.put(
  "/:id",
  updateInvoice
);

// DELETE
router.delete(
  "/:id",
  deleteInvoice
);

module.exports = router;