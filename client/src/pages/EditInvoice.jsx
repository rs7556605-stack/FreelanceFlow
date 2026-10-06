import React, { useEffect, useState } from "react";

import { ArrowLeft, Save } from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";

import API from "../services/api";

import "./EditInvoice.css";

const EditInvoice = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  // =====================================================
  // STATES
  // =====================================================

  const [invoice, setInvoice] = useState(null);

  const [dueDate, setDueDate] = useState("");

  const [status, setStatus] = useState("Draft");

  // IMPORTANT:
  // Tax percentage ko exact value ke roop mein rakhenge.
  // 18 => "18"
  // 18.5 => "18.5"
  const [taxPercent, setTaxPercent] = useState("0");

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [message, setMessage] = useState("");

  // =====================================================
  // LOAD INVOICE
  // =====================================================

  const loadInvoice = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get(`/invoices/${id}`);

      console.log("Invoice Load Response:", response.data);

      if (!response.data.success) {
        setError(
          response.data.message ||
            "Failed to load invoice"
        );

        return;
      }

      const data = response.data.invoice;

      setInvoice(data);

      // =================================================
      // DUE DATE
      // =================================================

      if (data.dueDate) {
        const date = new Date(data.dueDate);

        setDueDate(
          date.toISOString().split("T")[0]
        );
      } else {
        setDueDate("");
      }

      // =================================================
      // STATUS
      // =================================================

      setStatus(data.status || "Draft");

      // =================================================
      // TAX PERCENT
      // =================================================
      //
      // IMPORTANT:
      //
      // New invoice mein backend se taxPercent aayega.
      //
      // Example:
      //
      // taxPercent: 18
      //
      // To exactly 18 hi show hoga.
      //
      // tax / subtotal * 100 NAHI karna.
      //

      if (
        data.taxPercent !== undefined &&
        data.taxPercent !== null
      ) {
        setTaxPercent(
          String(data.taxPercent)
        );
      } else {
        // ------------------------------------------------
        // OLD INVOICE FALLBACK
        // ------------------------------------------------
        //
        // Sirf purani invoices ke liye.
        // Jinke database mein taxPercent nahi hai.
        //

        const subtotal = Number(
          data.subtotal || 0
        );

        const taxAmount = Number(
          data.tax || 0
        );

        if (subtotal > 0) {
          const percentage =
            (taxAmount / subtotal) * 100;

          setTaxPercent(
            percentage.toFixed(2)
          );
        } else {
          setTaxPercent("0");
        }
      }
    } catch (error) {
      console.error(
        "Load Invoice Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load invoice"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    if (id) {
      loadInvoice();
    }
  }, [id]);

  // =====================================================
  // TAX CHANGE
  // =====================================================

  const handleTaxChange = (event) => {
    const value = event.target.value;

    // Empty allow
    if (value === "") {
      setTaxPercent("");
      setError("");
      return;
    }

    const numberValue = Number(value);

    if (Number.isNaN(numberValue)) {
      return;
    }

    // Maximum 100
    if (numberValue > 100) {
      setTaxPercent("100");
      setError(
        "Tax must be between 0 and 100"
      );
      return;
    }

    // Minimum 0
    if (numberValue < 0) {
      setTaxPercent("0");
      return;
    }

    setTaxPercent(value);
    setError("");
  };

  // =====================================================
  // UPDATE INVOICE
  // =====================================================

  const handleUpdate = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);

      setError("");

      setMessage("");

      // =================================================
      // TAX PERCENTAGE
      // =================================================

      const finalTaxPercent =
        taxPercent === ""
          ? 0
          : Number(taxPercent);

      // =================================================
      // VALIDATE TAX
      // =================================================

      if (
        Number.isNaN(finalTaxPercent) ||
        finalTaxPercent < 0 ||
        finalTaxPercent > 100
      ) {
        setError(
          "Tax must be between 0 and 100"
        );

        setSaving(false);

        return;
      }

      // =================================================
      // SUBTOTAL
      // =================================================

      const subtotal = Number(
        invoice?.subtotal || 0
      );

      // =================================================
      // TAX AMOUNT
      // =================================================
      //
      // Example:
      //
      // subtotal = 6011.65
      // taxPercent = 18
      //
      // taxAmount = 1082.10
      //

      const taxAmount = Number(
        (
          (subtotal * finalTaxPercent) /
          100
        ).toFixed(2)
      );

      // =================================================
      // TOTAL
      // =================================================

      const total = Number(
        (
          subtotal + taxAmount
        ).toFixed(2)
      );

      console.log(
        "--------------------------------"
      );

      console.log(
        "Invoice Update"
      );

      console.log(
        "Subtotal:",
        subtotal
      );

      console.log(
        "Tax Percent:",
        finalTaxPercent
      );

      console.log(
        "Tax Amount:",
        taxAmount
      );

      console.log(
        "Total:",
        total
      );

      console.log(
        "--------------------------------"
      );

      // =================================================
      // PAYLOAD
      // =================================================
      //
      // IMPORTANT:
      //
      // Tax percentage directly send karna hai.
      //
      // 18 => 18
      //
      // Backend tax amount calculate karega.
      //

      const payload = {
        dueDate: dueDate || null,

        status: status || "Draft",

        taxPercent: finalTaxPercent,
      };

      console.log(
        "Update Invoice Payload:",
        payload
      );

      // =================================================
      // API REQUEST
      // =================================================

      const response = await API.put(
        `/invoices/${id}`,
        payload
      );

      console.log(
        "Update Invoice Response:",
        response.data
      );

      // =================================================
      // SUCCESS
      // =================================================

      if (response.data.success) {
        setMessage(
          "Invoice updated successfully."
        );

        // =================================================
        // UPDATE LOCAL DATA
        // =================================================

        if (response.data.invoice) {
          const updatedInvoice =
            response.data.invoice;

          setInvoice(updatedInvoice);

          // ---------------------------------------------
          // DUE DATE
          // ---------------------------------------------

          if (updatedInvoice.dueDate) {
            setDueDate(
              new Date(
                updatedInvoice.dueDate
              )
                .toISOString()
                .split("T")[0]
            );
          } else {
            setDueDate("");
          }

          // ---------------------------------------------
          // STATUS
          // ---------------------------------------------

          setStatus(
            updatedInvoice.status ||
              "Draft"
          );

          // ---------------------------------------------
          // TAX PERCENT
          // ---------------------------------------------
          //
          // IMPORTANT:
          //
          // Backend se taxPercent directly read karo.
          //
          // tax / subtotal * 100 MAT karo.
          //
          // Isi se 18 -> 18.03 problem fix hoti hai.
          //

          if (
            updatedInvoice.taxPercent !==
              undefined &&
            updatedInvoice.taxPercent !==
              null
          ) {
            setTaxPercent(
              String(
                updatedInvoice.taxPercent
              )
            );
          } else {
            setTaxPercent(
              String(finalTaxPercent)
            );
          }
        }

        // =================================================
        // REDIRECT
        // =================================================

        setTimeout(() => {
          navigate(`/invoices/${id}`);
        }, 800);
      }
    } catch (error) {
      console.error(
        "Update Invoice Error:",
        error
      );

      console.error(
        "Server Response:",
        error.response?.data
      );

      setError(
        error.response?.data?.message ||
          "Failed to update invoice"
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // CURRENCY
  // =====================================================

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }
    ).format(Number(amount) || 0);
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="edit-invoice-page">
        <div className="edit-invoice-loading">
          Loading invoice...
        </div>
      </div>
    );
  }

  // =====================================================
  // NOT FOUND
  // =====================================================

  if (!invoice) {
    return (
      <div className="edit-invoice-page">
        <div className="edit-invoice-container">

          <button
            type="button"
            className="edit-back-btn"
            onClick={() =>
              navigate("/invoices")
            }
          >
            <ArrowLeft size={18} />

            Back to Invoices
          </button>

          <div className="edit-invoice-error">
            {error ||
              "Invoice not found"}
          </div>

        </div>
      </div>
    );
  }

  // =====================================================
  // LIVE CALCULATION
  // =====================================================

  const subtotal = Number(
    invoice.subtotal || 0
  );

  const currentTaxPercent =
    taxPercent === ""
      ? 0
      : Number(taxPercent) || 0;

  const taxAmount = Number(
    (
      (subtotal *
        currentTaxPercent) /
      100
    ).toFixed(2)
  );

  const total = Number(
    (
      subtotal + taxAmount
    ).toFixed(2)
  );

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="edit-invoice-page">

      <div className="edit-invoice-container">

        {/* BACK BUTTON */}

        <button
          type="button"
          className="edit-back-btn"
          onClick={() =>
            navigate(`/invoices/${id}`)
          }
          disabled={saving}
        >
          <ArrowLeft size={18} />

          Back to Invoice
        </button>

        {/* HEADER */}

        <div className="edit-invoice-header">

          <div>

            <h1>
              Edit Invoice
            </h1>

            <p>
              {invoice.invoiceNumber}
            </p>

          </div>

        </div>

        {/* ERROR */}

        {error && (
          <div className="edit-invoice-error">
            {error}
          </div>
        )}

        {/* SUCCESS */}

        {message && (
          <div className="edit-invoice-success">
            {message}
          </div>
        )}

        {/* FORM */}

        <form
          className="edit-invoice-form"
          onSubmit={handleUpdate}
        >

          {/* INVOICE INFORMATION */}

          <div className="edit-invoice-section">

            <h2>
              Invoice Information
            </h2>

            <div className="edit-info-grid">

              {/* INVOICE NUMBER */}

              <div>
                <span>
                  Invoice Number
                </span>

                <strong>
                  {invoice.invoiceNumber}
                </strong>
              </div>

              {/* CLIENT */}

              <div>
                <span>
                  Client
                </span>

                <strong>
                  {invoice.client?.name ||
                    "Client"}
                </strong>
              </div>

              {/* SUBTOTAL */}

              <div>
                <span>
                  Subtotal
                </span>

                <strong>
                  {formatCurrency(
                    subtotal
                  )}
                </strong>
              </div>

            </div>

          </div>

          {/* EDIT DETAILS */}

          <div className="edit-invoice-section">

            <h2>
              Edit Details
            </h2>

            <div className="edit-fields-grid">

              {/* DUE DATE */}

              <div className="edit-field">

                <label>
                  Due Date
                </label>

                <input
                  type="date"
                  value={dueDate}
                  onChange={(event) =>
                    setDueDate(
                      event.target.value
                    )
                  }
                  disabled={saving}
                />

              </div>

              {/* STATUS */}

              <div className="edit-field">

                <label>
                  Status
                </label>

                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(
                      event.target.value
                    )
                  }
                  disabled={saving}
                >

                  <option value="Draft">
                    Draft
                  </option>

                  <option value="Pending">
                    Pending
                  </option>

                  <option value="Paid">
                    Paid
                  </option>

                  <option value="Overdue">
                    Overdue
                  </option>

                </select>

              </div>

              {/* TAX */}

              <div className="edit-field">

                <label>
                  Tax (%)
                </label>

                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={taxPercent}
                  onChange={
                    handleTaxChange
                  }
                  disabled={saving}
                />

                <small>
                  Enter tax percentage
                  between 0 and 100.
                </small>

              </div>

            </div>

          </div>

          {/* SUMMARY */}

          <div className="edit-invoice-summary">

            {/* SUBTOTAL */}

            <div>

              <span>
                Subtotal
              </span>

              <strong>
                {formatCurrency(
                  subtotal
                )}
              </strong>

            </div>

            {/* TAX */}

            <div>

              <span>
                Tax ({currentTaxPercent}%)
              </span>

              <strong>
                {formatCurrency(
                  taxAmount
                )}
              </strong>

            </div>

            {/* TOTAL */}

            <div className="edit-total">

              <span>
                Total
              </span>

              <strong>
                {formatCurrency(
                  total
                )}
              </strong>

            </div>

          </div>

          {/* ACTIONS */}

          <div className="edit-invoice-actions">

            {/* CANCEL */}

            <button
              type="button"
              className="edit-cancel-btn"
              onClick={() =>
                navigate(
                  `/invoices/${id}`
                )
              }
              disabled={saving}
            >
              Cancel
            </button>

            {/* SAVE */}

            <button
              type="submit"
              className="edit-save-btn"
              disabled={saving}
            >
              <Save size={18} />

              {saving
                ? "Saving..."
                : "Save Changes"}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default EditInvoice;