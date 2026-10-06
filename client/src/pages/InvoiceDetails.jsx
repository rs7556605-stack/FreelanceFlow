import React, { useEffect, useState } from "react";

import {
  ArrowLeft,
  CalendarDays,
  User,
  FileText,
  Download,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import API from "../services/api";
import "./InvoiceDetails.css";

const InvoiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  // =====================================================
  // LOAD INVOICE
  // =====================================================

  const loadInvoice = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get(`/invoices/${id}`);

      if (response.data.success) {
        setInvoice(response.data.invoice);
      }
    } catch (error) {
      console.error("Load Invoice Error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load invoice"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadInvoice();
    }
  }, [id]);

  // =====================================================
  // DOWNLOAD PDF
  // =====================================================

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);

      const response = await API.get(
        `/invoices/${id}/pdf`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob(
        [response.data],
        {
          type: "application/pdf",
        }
      );

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      link.download = `${
        invoice?.invoiceNumber || "invoice"
      }.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(
        "Download Invoice PDF Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to download invoice PDF"
      );
    } finally {
      setDownloading(false);
    }
  };

  // =====================================================
  // FORMAT CURRENCY
  // =====================================================

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // FORMAT HOURS
  // Converts decimal hours into HH:MM:SS
  //
  // Example:
  // 0.02 -> 00:01:12
  // 1.50 -> 01:30:00
  // 2.75 -> 02:45:00
  // =====================================================

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
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="invoice-details-page">
        <div className="invoice-details-loading">
          Loading invoice...
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error || !invoice) {
    return (
      <div className="invoice-details-page">
        <div className="invoice-details-container">

          <button
            type="button"
            className="invoice-details-back-btn"
            onClick={() =>
              navigate("/invoices")
            }
          >
            <ArrowLeft size={18} />
            Back to Invoices
          </button>

          <div className="invoice-details-error">
            {error || "Invoice not found"}
          </div>

        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="invoice-details-page">

      <div className="invoice-details-container">

        {/* =================================================
            TOP BAR
        ================================================= */}

        <div className="invoice-details-top">

          <button
            type="button"
            className="invoice-details-back-btn"
            onClick={() =>
              navigate("/invoices")
            }
          >
            <ArrowLeft size={18} />
            Back to Invoices
          </button>

          <div>
            <span
              className={`invoice-details-status ${
                invoice.status?.toLowerCase()
              }`}
            >
              {invoice.status}
            </span>

            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={downloading}
            >
              <Download size={17} />

              {downloading
                ? "Downloading..."
                : "Download PDF"}
            </button>
          </div>

        </div>

        {/* =================================================
            INVOICE CARD
        ================================================= */}

        <div className="invoice-details-card">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="invoice-details-header">

            <div>

              <div className="invoice-logo">
                <FileText size={24} />
              </div>

              <h1>
                INVOICE
              </h1>

              <p className="invoice-number">
                {invoice.invoiceNumber}
              </p>

            </div>

            <div className="invoice-date-box">

              <div>

                <div>
                  <span>
                    Invoice Date
                  </span>

                  <strong>
                    {formatDate(
                      invoice.invoiceDate
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Due Date
                  </span>

                  <strong>
                    {formatDate(
                      invoice.dueDate
                    )}
                  </strong>
                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              CLIENT
          ================================================= */}

          <div className="invoice-client-section">

            <div className="invoice-client-box">

              <div className="invoice-section-icon">
                <User size={19} />
              </div>

              <div>

                <span className="invoice-label">
                  BILL TO
                </span>

                <h3>
                  {invoice.client?.name ||
                    "Client"}
                </h3>

                {invoice.client?.company && (
                  <p>
                    {invoice.client.company}
                  </p>
                )}

                {invoice.client?.email && (
                  <p>
                    {invoice.client.email}
                  </p>
                )}

                {invoice.client?.address && (
                  <p>
                    {invoice.client.address}
                  </p>
                )}

              </div>

            </div>

            {/* BILLING PERIOD */}

            <div className="invoice-period-box">

              <div className="invoice-section-icon">
                <CalendarDays size={19} />
              </div>

              <div>

                <span className="invoice-label">
                  BILLING PERIOD
                </span>

                <p>
                  {formatDate(
                    invoice.periodStart
                  )}

                  {" — "}

                  {formatDate(
                    invoice.periodEnd
                  )}
                </p>

              </div>

            </div>

          </div>

          {/* =================================================
              ITEMS
          ================================================= */}

          <div className="invoice-items-section">

            <h2>
              Invoice Items
            </h2>

            <div className="invoice-items-wrapper">

              <table className="invoice-items-table">

                <thead>

                  <tr>

                    <th>
                      Description
                    </th>

                    <th>
                      Hours
                    </th>

                    <th>
                      Rate
                    </th>

                    <th>
                      Amount
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {invoice.items &&
                  invoice.items.length > 0 ? (

                    invoice.items.map(
                      (item, index) => (

                        <tr key={index}>

                          {/* DESCRIPTION */}

                          <td>
                            {item.description}
                          </td>

                          {/* HOURS */}

                          <td>
                            {formatHours(
                              item.hours
                            )}
                          </td>

                          {/* RATE */}

                          <td>
                            {formatCurrency(
                              item.hourlyRate
                            )}
                          </td>

                          {/* AMOUNT */}

                          <td>
                            <strong>
                              {formatCurrency(
                                item.amount
                              )}
                            </strong>
                          </td>

                        </tr>

                      )
                    )

                  ) : (

                    <tr>

                      <td
                        colSpan="4"
                        style={{
                          textAlign: "center",
                        }}
                      >
                        No invoice items found
                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </div>

          {/* =================================================
              TOTAL
          ================================================= */}

          <div className="invoice-total-section">

            <div className="invoice-total-box">

              {/* SUBTOTAL */}

              <div className="invoice-total-row">

                <span>
                  Subtotal
                </span>

                <strong>
                  {formatCurrency(
                    invoice.subtotal
                  )}
                </strong>

              </div>

              {/* TAX */}

              <div className="invoice-total-row">

                <span>
                  Tax (
                  {Number(
                    invoice.taxPercent || 0
                  )}
                  %)
                </span>

                <strong>
                  {formatCurrency(
                    invoice.tax
                  )}
                </strong>

              </div>

              {/* TOTAL */}

              <div className="invoice-grand-total">

                <span>
                  Total
                </span>

                <strong>
                  {formatCurrency(
                    invoice.total
                  )}
                </strong>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default InvoiceDetails;