const PDFDocument = require("pdfkit");

const generateInvoicePDF = (invoice, res) => {
  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
  });

  res.setHeader(
    "Content-Type",
    "application/pdf"
  );

  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${invoice.invoiceNumber || "invoice"}.pdf"`
  );

  doc.pipe(res);

  // =====================================================
  // HELPERS
  // =====================================================

  const formatCurrency = (amount) => {
    return `Rs. ${Number(amount || 0).toFixed(2)}`;
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatHours = (hours) => {
    const totalSeconds = Math.round(
      Number(hours || 0) * 3600
    );

    const hrs = Math.floor(
      totalSeconds / 3600
    );

    const mins = Math.floor(
      (totalSeconds % 3600) / 60
    );

    const secs = totalSeconds % 60;

    return [
      String(hrs).padStart(2, "0"),
      String(mins).padStart(2, "0"),
      String(secs).padStart(2, "0"),
    ].join(":");
  };

  // =====================================================
  // PAGE CONSTANTS
  // =====================================================

  const pageLeft = 50;
  const pageRight = 545;
  const pageWidth = 495;

  // =====================================================
  // HEADER
  // =====================================================

  doc
    .fontSize(26)
    .font("Helvetica-Bold")
    .fillColor("#111827")
    .text(
      "INVOICE",
      pageLeft,
      45
    );

  doc
    .fontSize(10)
    .font("Helvetica")
    .fillColor("#6b7280")
    .text(
      invoice.invoiceNumber || "Invoice",
      pageLeft,
      78
    );

  // Status
  if (invoice.status) {
    doc
      .fontSize(9)
      .font("Helvetica-Bold")
      .fillColor("#374151")
      .text(
        String(invoice.status).toUpperCase(),
        445,
        55,
        {
          width: 100,
          align: "right",
        }
      );
  }

  // Header line
  doc
    .strokeColor("#d1d5db")
    .moveTo(pageLeft, 100)
    .lineTo(pageRight, 100)
    .stroke();

  // =====================================================
  // INVOICE DATE / DUE DATE
  // =====================================================

  const dateTop = 120;

  // Invoice Date
  doc
    .fontSize(9)
    .font("Helvetica-Bold")
    .fillColor("#6b7280")
    .text(
      "INVOICE DATE",
      pageLeft,
      dateTop
    );

  doc
    .fontSize(11)
    .font("Helvetica")
    .fillColor("#111827")
    .text(
      formatDate(invoice.invoiceDate),
      pageLeft,
      dateTop + 16
    );

  // Due Date
  doc
    .fontSize(9)
    .font("Helvetica-Bold")
    .fillColor("#6b7280")
    .text(
      "DUE DATE",
      300,
      dateTop
    );

  doc
    .fontSize(11)
    .font("Helvetica")
    .fillColor("#111827")
    .text(
      formatDate(invoice.dueDate),
      300,
      dateTop + 16
    );

  // =====================================================
  // BILL TO / BILLING PERIOD
  // =====================================================

  const infoTop = 180;

  // -----------------------------------------------------
  // BILL TO
  // -----------------------------------------------------

  doc
    .fontSize(11)
    .font("Helvetica-Bold")
    .fillColor("#111827")
    .text(
      "BILL TO",
      pageLeft,
      infoTop
    );

  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .fillColor("#111827")
    .text(
      invoice.client?.name || "Client",
      pageLeft,
      infoTop + 22
    );

  let clientY = infoTop + 40;

  if (invoice.client?.company) {
    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#374151")
      .text(
        invoice.client.company,
        pageLeft,
        clientY,
        {
          width: 210,
        }
      );

    clientY += 15;
  }

  if (invoice.client?.email) {
    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#374151")
      .text(
        invoice.client.email,
        pageLeft,
        clientY,
        {
          width: 210,
        }
      );

    clientY += 15;
  }

  if (invoice.client?.phone) {
    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#374151")
      .text(
        invoice.client.phone,
        pageLeft,
        clientY
      );

    clientY += 15;
  }

  if (invoice.client?.address) {
    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#374151")
      .text(
        invoice.client.address,
        pageLeft,
        clientY,
        {
          width: 210,
        }
      );
  }

  // -----------------------------------------------------
  // BILLING PERIOD
  // -----------------------------------------------------

  doc
    .fontSize(11)
    .font("Helvetica-Bold")
    .fillColor("#111827")
    .text(
      "BILLING PERIOD",
      320,
      infoTop
    );

  doc
    .fontSize(10)
    .font("Helvetica")
    .fillColor("#6b7280")
    .text(
      "Start Date",
      320,
      infoTop + 27
    );

  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .fillColor("#111827")
    .text(
      formatDate(invoice.periodStart),
      395,
      infoTop + 27
    );

  doc
    .fontSize(10)
    .font("Helvetica")
    .fillColor("#6b7280")
    .text(
      "End Date",
      320,
      infoTop + 50
    );

  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .fillColor("#111827")
    .text(
      formatDate(invoice.periodEnd),
      395,
      infoTop + 50
    );

  // =====================================================
  // INVOICE ITEMS
  // =====================================================

  const tableTitleY = 300;

  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .fillColor("#111827")
    .text(
      "INVOICE ITEMS",
      pageLeft,
      tableTitleY
    );

  // =====================================================
  // TABLE HEADER
  // =====================================================

  const headerY = tableTitleY + 25;

  // Header background
  doc
    .rect(
      pageLeft,
      headerY,
      pageWidth,
      30
    )
    .fill("#f3f4f6");

  // Header text
  doc
    .fontSize(9)
    .font("Helvetica-Bold")
    .fillColor("#111827")
    .text(
      "DESCRIPTION",
      60,
      headerY + 10
    );

  doc.text(
    "HOURS",
    315,
    headerY + 10
  );

  doc.text(
    "RATE",
    385,
    headerY + 10
  );

  doc.text(
    "AMOUNT",
    465,
    headerY + 10
  );

  // =====================================================
  // ITEMS
  // =====================================================

  let itemY = headerY + 40;

  if (
    invoice.items &&
    invoice.items.length > 0
  ) {
    invoice.items.forEach((item) => {

      // Description
      doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor("#111827")
        .text(
          item.description || "-",
          60,
          itemY,
          {
            width: 235,
            lineBreak: false,
          }
        );

      // Hours
      doc
        .font("Helvetica")
        .text(
          formatHours(item.hours),
          315,
          itemY
        );

      // Rate
      doc.text(
        formatCurrency(item.hourlyRate),
        385,
        itemY
      );

      // Amount
      doc
        .font("Helvetica-Bold")
        .text(
          formatCurrency(item.amount),
          465,
          itemY
        );

      // Row line
      doc
        .strokeColor("#e5e7eb")
        .moveTo(
          pageLeft,
          itemY + 20
        )
        .lineTo(
          pageRight,
          itemY + 20
        )
        .stroke();

      itemY += 35;

      // New page if required
      if (itemY > 700) {
        doc.addPage();
        itemY = 60;
      }
    });
  } else {

    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor("#6b7280")
      .text(
        "No invoice items found",
        60,
        itemY
      );

    itemY += 35;
  }

  // =====================================================
  // TOTALS
  // =====================================================

  const totalsY = itemY + 20;

  // Top line
  doc
    .strokeColor("#111827")
    .moveTo(330, totalsY)
    .lineTo(pageRight, totalsY)
    .stroke();

  // Subtotal
  doc
    .fontSize(10)
    .font("Helvetica")
    .fillColor("#374151")
    .text(
      "Subtotal",
      350,
      totalsY + 15
    );

  doc
    .text(
      formatCurrency(invoice.subtotal),
      465,
      totalsY + 15
    );

  // Tax
  doc
    .text(
      `Tax (${Number(
        invoice.taxPercent || 0
      )}%)`,
      350,
      totalsY + 38
    );

  doc
    .text(
      formatCurrency(invoice.tax),
      465,
      totalsY + 38
    );

  // Total line
  doc
    .strokeColor("#111827")
    .moveTo(330, totalsY + 62)
    .lineTo(pageRight, totalsY + 62)
    .stroke();

  // Grand Total
  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .fillColor("#111827")
    .text(
      "TOTAL",
      350,
      totalsY + 76
    );

  doc
    .text(
      formatCurrency(invoice.total),
      465,
      totalsY + 76
    );

  // =====================================================
  // FOOTER
  // =====================================================

  doc
    .fontSize(8)
    .font("Helvetica")
    .fillColor("#6b7280")
    .text(
      "Generated by FreelanceFlow",
      pageLeft,
      770,
      {
        width: pageWidth,
        align: "center",
      }
    );

  // =====================================================
  // FINISH PDF
  // =====================================================

  doc.end();
};

module.exports = generateInvoicePDF;