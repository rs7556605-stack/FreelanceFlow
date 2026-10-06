const mongoose = require("mongoose");

const Invoice = require("../models/Invoice");
const TimeLog = require("../models/TimeLog");
const Client = require("../models/Client");
const Project = require("../models/Project");
const generateInvoicePDF = require("../utils/generateInvoicePDF");

// =====================================================
// HELPER - ROUND MONEY
// =====================================================

const roundMoney = (value) => {
  return Number(
    (Number(value) || 0).toFixed(2)
  );
};

// =====================================================
// HELPER - TAX PERCENT VALIDATION
// =====================================================

const validateTaxPercent = (
  value
) => {
  const taxPercent = Number(value);

  if (
    Number.isNaN(taxPercent) ||
    taxPercent < 0 ||
    taxPercent > 100
  ) {
    return null;
  }

  return taxPercent;
};

// =====================================================
// GET ALL INVOICES
// =====================================================

const getInvoices = async (
  req,
  res
) => {
  try {
    const invoices =
      await Invoice.find({
        user: req.user.id,
      })
        .populate(
          "client",
          "name email company phone address"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      invoices,
    });
  } catch (error) {
    console.error(
      "Get Invoices Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch invoices",
    });
  }
};

// =====================================================
// GET SINGLE INVOICE
// =====================================================

const getInvoice = async (
  req,
  res
) => {
  try {
    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid invoice ID",
      });
    }

    const invoice =
      await Invoice.findOne({
        _id: req.params.id,
        user: req.user.id,
      })
        .populate(
          "client",
          "name email company phone address"
        )
        .populate(
          "items.timeLogId"
        );

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message:
          "Invoice not found",
      });
    }

    return res.status(200).json({
      success: true,
      invoice,
    });
  } catch (error) {
    console.error(
      "Get Invoice Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch invoice",
    });
  }
};

// =====================================================
// GET UNBILLED TIME LOGS
// =====================================================

const getUnbilledTimeLogs =
  async (req, res) => {
    try {
      const {
        clientId,
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          clientId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid client ID",
        });
      }

      // -------------------------------------------------
      // CHECK CLIENT OWNERSHIP
      // -------------------------------------------------

      const client =
        await Client.findOne({
          _id: clientId,
          user: req.user.id,
        });

      if (!client) {
        return res.status(404).json({
          success: false,
          message:
            "Client not found",
        });
      }

      // -------------------------------------------------
      // FIND CLIENT PROJECTS
      // -------------------------------------------------

      const projects =
        await Project.find({
          user: req.user.id,
          client: clientId,
        }).select("_id");

      const projectIds =
        projects.map(
          (project) =>
            project._id
        );

      // -------------------------------------------------
      // FIND UNBILLED COMPLETED LOGS
      // -------------------------------------------------

      const timeLogs =
        await TimeLog.find({
          user: req.user.id,

          project: {
            $in: projectIds,
          },

          billed: false,

          endTime: {
            $ne: null,
          },

          duration: {
            $gt: 0,
          },
        })
          .populate(
            "project",
            "name client"
          )
          .populate(
            "task",
            "title"
          )
          .sort({
            startTime: -1,
          });

      return res.status(200).json({
        success: true,
        timeLogs,
      });
    } catch (error) {
      console.error(
        "Get Unbilled Time Logs Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch unbilled time logs",
      });
    }
  };

// =====================================================
// CREATE INVOICE
// =====================================================

const createInvoice = async (
  req,
  res
) => {
  try {
    const {
      client,
      dueDate,
      periodStart,
      periodEnd,
      timeLogIds,
    } = req.body;

    // -------------------------------------------------
    // TAX PERCENT
    // -------------------------------------------------
    //
    // New frontend:
    // taxPercent
    //
    // Old frontend compatibility:
    // tax
    //

    const rawTaxPercent =
      req.body.taxPercent !==
      undefined
        ? req.body.taxPercent
        : req.body.tax;

    const taxPercent =
      validateTaxPercent(
        rawTaxPercent ?? 0
      );

    if (taxPercent === null) {
      return res.status(400).json({
        success: false,
        message:
          "Tax must be between 0 and 100.",
      });
    }

    // -------------------------------------------------
    // CLIENT VALIDATION
    // -------------------------------------------------

    if (!client) {
      return res.status(400).json({
        success: false,
        message:
          "Client is required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        client
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid client ID",
      });
    }

    // -------------------------------------------------
    // TIME LOG VALIDATION
    // -------------------------------------------------

    if (
      !Array.isArray(
        timeLogIds
      ) ||
      timeLogIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please select at least one time log.",
      });
    }

    // -------------------------------------------------
    // CHECK CLIENT
    // -------------------------------------------------

    const clientDoc =
      await Client.findOne({
        _id: client,
        user: req.user.id,
      });

    if (!clientDoc) {
      return res.status(404).json({
        success: false,
        message:
          "Client not found",
      });
    }

    // -------------------------------------------------
    // GET TIME LOGS
    // -------------------------------------------------

    const logs =
      await TimeLog.find({
        _id: {
          $in: timeLogIds,
        },

        user: req.user.id,

        billed: false,

        endTime: {
          $ne: null,
        },

        duration: {
          $gt: 0,
        },
      })
        .populate(
          "project",
          "name client"
        )
        .populate(
          "task",
          "title"
        );

    if (
      logs.length !==
      timeLogIds.length
    ) {
      return res.status(400).json({
        success: false,
        message:
          "One or more selected time logs are invalid or already billed.",
      });
    }

    // -------------------------------------------------
    // VERIFY ALL LOGS BELONG TO CLIENT
    // -------------------------------------------------

    const invalidClientLog =
      logs.find(
        (log) =>
          String(
            log.project?.client
          ) !== String(client)
      );

    if (invalidClientLog) {
      return res.status(403).json({
        success: false,
        message:
          "One or more time logs do not belong to this client.",
      });
    }

    // -------------------------------------------------
    // BUILD ITEMS
    // -------------------------------------------------

    const items = logs.map(
      (log) => {
        const durationSeconds =
          Number(
            log.duration || 0
          );

        const hours =
          durationSeconds / 3600;

        const hourlyRate =
          Number(
            log.hourlyRate || 0
          );

        const amount =
          hours * hourlyRate;

        return {
          description:
            log.task?.title ||
            log.project?.name ||
            "Work",

          // IMPORTANT:
          // Keep full decimal value.
          // Do NOT use toFixed(2) here.
          hours,

          hourlyRate,

          amount:
            roundMoney(amount),

          timeLogId: log._id,
        };
      }
    );

    // -------------------------------------------------
    // SUBTOTAL
    // -------------------------------------------------

    const subtotal =
      roundMoney(
        items.reduce(
          (sum, item) =>
            sum +
            Number(
              item.amount || 0
            ),
          0
        )
      );

    // -------------------------------------------------
    // TAX AMOUNT
    // -------------------------------------------------

    const taxAmount =
      roundMoney(
        (subtotal *
          taxPercent) /
          100
      );

    // -------------------------------------------------
    // TOTAL
    // -------------------------------------------------

    const total =
      roundMoney(
        subtotal +
          taxAmount
      );

    // -------------------------------------------------
    // INVOICE NUMBER
    // -------------------------------------------------

    const invoiceNumber =
      `INV-${Date.now()}`;

    // -------------------------------------------------
    // CREATE INVOICE
    // -------------------------------------------------

    const invoice =
      await Invoice.create({
        user: req.user.id,

        client,

        invoiceNumber,

        invoiceDate:
          new Date(),

        dueDate:
          dueDate || null,

        periodStart:
          periodStart || null,

        periodEnd:
          periodEnd || null,

        items,

        subtotal,

        // Actual tax amount
        tax: taxAmount,

        // Exact percentage entered
        taxPercent,

        total,

        status: "Draft",
      });

    // -------------------------------------------------
    // MARK TIME LOGS AS BILLED
    // -------------------------------------------------

    await TimeLog.updateMany(
      {
        _id: {
          $in: logs.map(
            (log) =>
              log._id
          ),
        },

        user: req.user.id,
      },
      {
        $set: {
          billed: true,
        },
      }
    );

    return res.status(201).json({
      success: true,
      message:
        "Invoice created successfully",
      invoice,
    });
  } catch (error) {
    console.error(
      "Create Invoice Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create invoice",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE INVOICE
// =====================================================

const updateInvoice = async (
  req,
  res
) => {
  try {
    const {
      dueDate,
      status,
    } = req.body;

    // -------------------------------------------------
    // FIND INVOICE
    // -------------------------------------------------

    const invoice =
      await Invoice.findOne({
        _id: req.params.id,
        user: req.user.id,
      });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message:
          "Invoice not found",
      });
    }

    // -------------------------------------------------
    // SUBTOTAL
    // -------------------------------------------------

    const subtotal =
      Number(
        invoice.subtotal || 0
      );

    // -------------------------------------------------
    // TAX PERCENT
    // -------------------------------------------------
    //
    // IMPORTANT:
    // NEVER calculate percentage from:
    //
    // tax / subtotal
    //
    // because rounded tax amount can produce:
    //
    // 18.03
    //
    // Instead use stored taxPercent.
    //

    let taxPercent;

    if (
      req.body.taxPercent !==
        undefined &&
      req.body.taxPercent !==
        null &&
      req.body.taxPercent !==
        ""
    ) {
      taxPercent =
        validateTaxPercent(
          req.body.taxPercent
        );

      if (
        taxPercent === null
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Tax must be between 0 and 100.",
        });
      }
    } else {
      // Keep existing exact percentage
      taxPercent =
        Number(
          invoice.taxPercent || 0
        );

      // Safety fallback for very old invoices
      if (
        taxPercent === 0 &&
        Number(invoice.tax || 0) >
          0 &&
        subtotal > 0
      ) {
        taxPercent =
          Number(
            (
              (Number(
                invoice.tax
              ) /
                subtotal) *
              100
            ).toFixed(2)
          );

        if (
          taxPercent < 0 ||
          taxPercent > 100
        ) {
          taxPercent = 0;
        }
      }
    }

    // -------------------------------------------------
    // TAX AMOUNT
    // -------------------------------------------------

    const taxAmount =
      roundMoney(
        (subtotal *
          taxPercent) /
          100
      );

    // -------------------------------------------------
    // TOTAL
    // -------------------------------------------------

    const total =
      roundMoney(
        subtotal +
          taxAmount
      );

    // -------------------------------------------------
    // UPDATE
    // -------------------------------------------------

    invoice.dueDate =
      dueDate !== undefined
        ? dueDate || null
        : invoice.dueDate;

    invoice.status =
      status || invoice.status;

    // Actual tax amount
    invoice.tax =
      taxAmount;

    // Exact percentage
    invoice.taxPercent =
      taxPercent;

    invoice.total =
      total;

    // -------------------------------------------------
    // PAYMENT DATE
    // -------------------------------------------------

    if (
      invoice.status ===
      "Paid"
    ) {
      if (
        !invoice.paymentDate
      ) {
        invoice.paymentDate =
          new Date();
      }
    } else {
      invoice.paymentDate =
        null;
    }

    await invoice.save();

    return res.status(200).json({
      success: true,
      message:
        "Invoice updated successfully",
      invoice,
    });
  } catch (error) {
    console.error(
      "Update Invoice Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update invoice",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE INVOICE
// =====================================================

const deleteInvoice = async (
  req,
  res
) => {
  try {
    const invoice =
      await Invoice.findOne({
        _id: req.params.id,
        user: req.user.id,
      });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message:
          "Invoice not found",
      });
    }

    // -------------------------------------------------
    // GET TIME LOG IDs
    // -------------------------------------------------

    const timeLogIds =
      invoice.items
        .map(
          (item) =>
            item.timeLogId
        )
        .filter(Boolean);

    // -------------------------------------------------
    // UNBILL TIME LOGS
    // -------------------------------------------------

    if (
      timeLogIds.length > 0
    ) {
      await TimeLog.updateMany(
        {
          _id: {
            $in: timeLogIds,
          },

          user: req.user.id,
        },
        {
          $set: {
            billed: false,
          },
        }
      );
    }

    // -------------------------------------------------
    // DELETE INVOICE
    // -------------------------------------------------

    await Invoice.deleteOne({
      _id: invoice._id,
      user: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message:
        "Invoice deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Invoice Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete invoice",
      error: error.message,
    });
  }
};




// =====================================================
// DOWNLOAD INVOICE PDF
// =====================================================

const downloadInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      user: req.user.id,
    })
      .populate(
        "client",
        "name email company phone address"
      )
      .populate("items.timeLogId");

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    generateInvoicePDF(invoice, res);
  } catch (error) {
    console.error(
      "Download Invoice PDF Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to generate invoice PDF",
    });
  }
};
// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  getInvoices,
  getInvoice,
  getUnbilledTimeLogs,
  createInvoice,
  updateInvoice,
  deleteInvoice,
   downloadInvoicePDF,
};