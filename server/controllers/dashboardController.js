const Client = require("../models/Client");
const Project = require("../models/Project");
const Invoice = require("../models/Invoice");
const Task = require("../models/Task");

// =====================================================
// GET DASHBOARD SUMMARY
// =====================================================

const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    // =================================================
    // TOTAL CLIENTS
    // =================================================

    const totalClients =
      await Client.countDocuments({
        user: userId,
      });

    // =================================================
    // ACTIVE PROJECTS
    // =================================================

    const activeProjects =
      await Project.countDocuments({
        user: userId,
        status: "Active",
      });

    // =================================================
    // PAID INVOICES
    // =================================================

    const paidInvoices =
      await Invoice.find({
        user: userId,
        status: "Paid",
      }).select(
        "total invoiceDate paymentDate"
      );

    // =================================================
    // PENDING + OVERDUE
    // =================================================

    const pendingInvoices =
      await Invoice.find({
        user: userId,
        status: {
          $in: [
            "Pending",
            "Overdue",
          ],
        },
      }).select(
        "total invoiceDate dueDate status"
      );

    // =================================================
    // TOTAL REVENUE
    // =================================================

    const totalRevenue =
      paidInvoices.reduce(
        (sum, invoice) =>
          sum +
          Number(
            invoice.total || 0
          ),
        0
      );

    // =================================================
    // OUTSTANDING
    // =================================================

    const outstandingAmount =
      pendingInvoices.reduce(
        (sum, invoice) =>
          sum +
          Number(
            invoice.total || 0
          ),
        0
      );

    // =================================================
    // INVOICE COUNTS
    // =================================================

    const paidInvoiceCount =
      paidInvoices.length;

    const pendingInvoiceCount =
      pendingInvoices.length;

    // =================================================
    // CURRENT YEAR
    // =================================================

    const currentYear =
      new Date().getFullYear();

    // =================================================
    // MONTHS
    // =================================================

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // =================================================
    // INITIALIZE 12 MONTHS
    // =================================================

    const monthlyRevenue =
      months.map(
        (month) => ({
          month,
          revenue: 0,
        })
      );

    // =================================================
    // CALCULATE MONTHLY PAID REVENUE
    // =================================================

    paidInvoices.forEach(
      (invoice) => {
        const revenueDate =
          invoice.paymentDate ||
          invoice.invoiceDate;

        if (!revenueDate) {
          return;
        }

        const date =
          new Date(revenueDate);

        const year =
          date.getFullYear();

        const monthIndex =
          date.getMonth();

        if (
          year === currentYear
        ) {
          monthlyRevenue[
            monthIndex
          ].revenue += Number(
            invoice.total || 0
          );
        }
      }
    );

    // =================================================
    // ROUND MONTHLY VALUES
    // =================================================

    const revenueByMonth =
      monthlyRevenue.map(
        (item) => ({
          month: item.month,

          revenue: Number(
            item.revenue.toFixed(2)
          ),
        })
      );

    // =================================================
    // RECENT PROJECTS
    // =================================================

    const recentProjects =
      await Project.find({
        user: userId,
      })
        .populate(
          "client",
          "name"
        )
        .sort({
          createdAt: -1,
        })
        .limit(5)
        .select(
          "name status deadline client createdAt"
        )
        .lean();

    // =================================================
    // RECENT INVOICES
    // =================================================

    const recentInvoices =
      await Invoice.find({
        user: userId,
      })
        .populate(
          "client",
          "name"
        )
        .sort({
          createdAt: -1,
        })
        .limit(5)
        .select(
          "invoiceNumber total status dueDate invoiceDate client createdAt"
        )
        .lean();

    // =================================================
    // UPCOMING PROJECT DEADLINES
    // =================================================

    const upcomingProjectDeadlines =
      await Project.find({
        user: userId,
        status: {
          $ne: "Completed",
        },
        deadline: {
          $ne: null,
          $gte: new Date(),
        },
      })
        .populate(
          "client",
          "name"
        )
        .sort({
          deadline: 1,
        })
        .limit(5)
        .select(
          "name status deadline client"
        )
        .lean();

    // =================================================
    // UPCOMING TASK DEADLINES
    // =================================================

    const upcomingTaskDeadlines =
      await Task.find({
        user: userId,
        status: {
          $ne: "Completed",
        },
        dueDate: {
          $ne: null,
          $gte: new Date(),
        },
      })
        .populate(
          "project",
          "name"
        )
        .sort({
          dueDate: 1,
        })
        .limit(5)
        .select(
          "title status dueDate project"
        )
        .lean();

    // =================================================
    // COMBINE PROJECT + TASK DEADLINES
    // =================================================

    const upcomingDeadlines = [
      ...upcomingProjectDeadlines.map(
        (project) => ({
          type: "Project",
          _id: project._id,
          title: project.name,
          date: project.deadline,
          status: project.status,
          clientName:
            project.client?.name ||
            "Unknown Client",
        })
      ),

      ...upcomingTaskDeadlines.map(
        (task) => ({
          type: "Task",
          _id: task._id,
          title: task.title,
          date: task.dueDate,
          status: task.status,
          projectName:
            task.project?.name ||
            "Unknown Project",
        })
      ),
    ]
      .sort(
        (a, b) =>
          new Date(a.date) -
          new Date(b.date)
      )
      .slice(0, 5);

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,

      stats: {
        totalClients,

        activeProjects,

        pendingInvoiceCount,

        paidInvoiceCount,

        totalRevenue: Number(
          totalRevenue.toFixed(2)
        ),

        outstandingAmount:
          Number(
            outstandingAmount.toFixed(2)
          ),
      },

      revenueByMonth,

      recentProjects,

      recentInvoices,

      upcomingDeadlines,
    });
  } catch (error) {
    console.error(
      "Dashboard Summary Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch dashboard summary",
    });
  }
};

module.exports = {
  getDashboardSummary,
};