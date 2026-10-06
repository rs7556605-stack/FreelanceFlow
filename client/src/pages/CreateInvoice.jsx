import React, {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  Save,
  Calculator,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import API from "../services/api";

import "./CreateInvoice.css";

const CreateInvoice = () => {
  const navigate = useNavigate();

  // =====================================================
  // STATES
  // =====================================================

  const [clients, setClients] = useState([]);
  const [timeLogs, setTimeLogs] = useState([]);

  const [selectedClient, setSelectedClient] =
    useState("");

  const [selectedLogs, setSelectedLogs] =
    useState([]);

  const [dueDate, setDueDate] =
    useState("");

  const [periodStart, setPeriodStart] =
    useState("");

  const [periodEnd, setPeriodEnd] =
    useState("");

  const [taxPercent, setTaxPercent] =
    useState(0);

  const [loadingClients, setLoadingClients] =
    useState(true);

  const [loadingLogs, setLoadingLogs] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  // =====================================================
  // LOAD CLIENTS
  // =====================================================

  const loadClients = async () => {
    try {
      setLoadingClients(true);
      setError("");

      const response =
        await API.get("/clients");

      console.log(
        "Clients Response:",
        response.data
      );

      if (response.data.success) {
        setClients(
          response.data.clients || []
        );
      } else {
        setError(
          response.data.message ||
            "Failed to load clients"
        );
      }
    } catch (error) {
      console.error(
        "Load Clients Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load clients"
      );
    } finally {
      setLoadingClients(false);
    }
  };

  // =====================================================
  // LOAD UNBILLED TIME LOGS
  // =====================================================

  const loadUnbilledLogs = async (
    clientId
  ) => {
    if (!clientId) {
      setTimeLogs([]);
      setSelectedLogs([]);
      return;
    }

    try {
      setLoadingLogs(true);
      setError("");
      setMessage("");

      const response =
        await API.get(
          `/invoices/unbilled/${clientId}`
        );

      console.log(
        "Unbilled Time Logs:",
        response.data
      );

      if (response.data.success) {
        setTimeLogs(
          response.data.timeLogs || []
        );

        setSelectedLogs([]);
      } else {
        setError(
          response.data.message ||
            "Failed to load unbilled time logs"
        );

        setTimeLogs([]);
        setSelectedLogs([]);
      }
    } catch (error) {
      console.error(
        "Load Unbilled Logs Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load unbilled time logs"
      );

      setTimeLogs([]);
      setSelectedLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadClients();
  }, []);

  // =====================================================
  // CLIENT CHANGE
  // =====================================================

  const handleClientChange = (
    event
  ) => {
    const clientId =
      event.target.value;

    setSelectedClient(clientId);

    setError("");
    setMessage("");

    loadUnbilledLogs(clientId);
  };

  // =====================================================
  // SELECT / UNSELECT LOG
  // =====================================================

  const toggleLog = (logId) => {
    setSelectedLogs(
      (previous) => {
        if (
          previous.includes(logId)
        ) {
          return previous.filter(
            (id) => id !== logId
          );
        }

        return [
          ...previous,
          logId,
        ];
      }
    );
  };

  // =====================================================
  // CALCULATIONS
  // =====================================================

  const selectedTimeLogs =
    timeLogs.filter((log) =>
      selectedLogs.includes(
        log._id
      )
    );

  // -----------------------------------------------------
  // SUBTOTAL
  // -----------------------------------------------------

  const subtotal =
    selectedTimeLogs.reduce(
      (total, log) => {
        const durationSeconds =
          Number(
            log.duration || 0
          );

        const hours =
          durationSeconds / 3600;

        const rate =
          Number(
            log.hourlyRate || 0
          );

        return (
          total +
          hours * rate
        );
      },
      0
    );

  // -----------------------------------------------------
  // TAX
  // -----------------------------------------------------

  const numericTaxPercent =
    Number(taxPercent) || 0;

  const taxAmount =
    subtotal *
    numericTaxPercent /
    100;

  // -----------------------------------------------------
  // TOTAL
  // -----------------------------------------------------

  const total =
    subtotal + taxAmount;

  // =====================================================
  // FORMAT CURRENCY
  // =====================================================

  const formatCurrency = (
    amount
  ) => {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }
    ).format(
      Number(amount) || 0
    );
  };

  // =====================================================
  // FORMAT DURATION
  // =====================================================
  //
  // IMPORTANT:
  // duration comes from backend in SECONDS.
  //
  // Examples:
  //
  // 1    -> 00:00:01
  // 30   -> 00:00:30
  // 59   -> 00:00:59
  // 60   -> 00:01:00
  // 90   -> 00:01:30
  // 3600 -> 01:00:00
  // 3605 -> 01:00:05
  //
  // =====================================================

  const formatDuration = (
    seconds
  ) => {
    const totalSeconds = Math.max(
      0,
      Math.round(
        Number(seconds) || 0
      )
    );

    const hours = Math.floor(
      totalSeconds / 3600
    );

    const minutes = Math.floor(
      (totalSeconds % 3600) / 60
    );

    const remainingSeconds =
      totalSeconds % 60;

    return [
      String(hours).padStart(
        2,
        "0"
      ),
      String(minutes).padStart(
        2,
        "0"
      ),
      String(
        remainingSeconds
      ).padStart(2, "0"),
    ].join(":");
  };

  // =====================================================
  // FORMAT DATE TIME
  // =====================================================

  const formatDateTime = (
    date
  ) => {
    if (!date) {
      return "-";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "-";
    }

    return parsedDate.toLocaleString(
      "en-IN"
    );
  };

  // =====================================================
  // TAX CHANGE
  // =====================================================

  const handleTaxChange = (
    event
  ) => {
    const value =
      event.target.value;

    // Allow empty field
    if (value === "") {
      setTaxPercent("");
      setError("");
      return;
    }

    const numericValue =
      Number(value);

    if (
      Number.isNaN(
        numericValue
      )
    ) {
      return;
    }

    if (
      numericValue < 0
    ) {
      setTaxPercent(0);
      return;
    }

    if (
      numericValue > 100
    ) {
      setTaxPercent(100);
      setError(
        "Tax percentage cannot be greater than 100."
      );
      return;
    }

    setError("");
    setTaxPercent(value);
  };

  // =====================================================
  // CREATE INVOICE
  // =====================================================

  const handleCreateInvoice =
    async (event) => {
      event.preventDefault();

      setError("");
      setMessage("");

      // -------------------------------------------------
      // CLIENT VALIDATION
      // -------------------------------------------------

      if (!selectedClient) {
        setError(
          "Please select a client."
        );

        return;
      }

      // -------------------------------------------------
      // TIME LOG VALIDATION
      // -------------------------------------------------

      if (
        selectedLogs.length === 0
      ) {
        setError(
          "Please select at least one time log."
        );

        return;
      }

      // -------------------------------------------------
      // TAX VALIDATION
      // -------------------------------------------------

      const finalTaxPercent =
        Number(taxPercent) || 0;

      if (
        finalTaxPercent < 0 ||
        finalTaxPercent > 100
      ) {
        setError(
          "Tax must be between 0 and 100."
        );

        return;
      }

      try {
        setSaving(true);

        // -------------------------------------------------
        // CREATE INVOICE
        // -------------------------------------------------

        const response =
          await API.post(
            "/invoices",
            {
              client:
                selectedClient,

              dueDate:
                dueDate || null,

              periodStart:
                periodStart || null,

              periodEnd:
                periodEnd || null,

              // Backend accepts tax.
              // This value represents percentage.
              tax:
                finalTaxPercent,

              timeLogIds:
                selectedLogs,
            }
          );

        console.log(
          "Create Invoice Response:",
          response.data
        );

        if (
          response.data.success
        ) {
          setMessage(
            "Invoice created successfully."
          );

          // -------------------------------------------------
          // REDIRECT
          // -------------------------------------------------

          setTimeout(() => {
            navigate(
              "/invoices"
            );
          }, 800);
        } else {
          setError(
            response.data.message ||
              "Failed to create invoice"
          );
        }
      } catch (error) {
        console.error(
          "Create Invoice Error:",
          error
        );

        setError(
          error.response?.data
            ?.message ||
            "Failed to create invoice"
        );
      } finally {
        setSaving(false);
      }
    };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="create-invoice-page">

      <div className="create-invoice-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="create-invoice-header">

          <button
            type="button"
            className="invoice-back-btn"
            onClick={() =>
              navigate("/invoices")
            }
          >
            <ArrowLeft size={19} />

            Back to Invoices
          </button>

          <div>
            <h1>
              Create Invoice
            </h1>

            <p>
              Create an invoice from your
              unbilled time logs.
            </p>
          </div>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="create-invoice-error">
            {error}
          </div>
        )}

        {/* =================================================
            SUCCESS
        ================================================= */}

        {message && (
          <div className="create-invoice-success">
            {message}
          </div>
        )}

        {/* =================================================
            FORM
        ================================================= */}

        <form
          className="create-invoice-form"
          onSubmit={
            handleCreateInvoice
          }
        >

          {/* =================================================
              1. CLIENT
          ================================================= */}

          <div className="invoice-section">

            <h2>
              1. Client
            </h2>

            <div className="invoice-field">

              <label>
                Select Client
              </label>

              <select
                value={
                  selectedClient
                }
                onChange={
                  handleClientChange
                }
                disabled={
                  loadingClients
                }
              >

                <option value="">
                  {loadingClients
                    ? "Loading clients..."
                    : "Select a client"}
                </option>

                {clients.map(
                  (client) => (
                    <option
                      key={
                        client._id
                      }
                      value={
                        client._id
                      }
                    >
                      {client.name}

                      {client.company
                        ? ` - ${client.company}`
                        : ""}
                    </option>
                  )
                )}

              </select>

              {!loadingClients &&
                clients.length ===
                  0 && (
                  <p className="invoice-help-text">
                    No clients found.
                    Please create a
                    client first.
                  </p>
                )}

            </div>

          </div>

          {/* =================================================
              2. BILLING DETAILS
          ================================================= */}

          <div className="invoice-section">

            <h2>
              2. Billing Details
            </h2>

            <div className="invoice-grid">

              {/* PERIOD START */}

              <div className="invoice-field">

                <label>
                  Period Start
                </label>

                <input
                  type="date"
                  value={
                    periodStart
                  }
                  onChange={(event) =>
                    setPeriodStart(
                      event.target.value
                    )
                  }
                />

              </div>

              {/* PERIOD END */}

              <div className="invoice-field">

                <label>
                  Period End
                </label>

                <input
                  type="date"
                  value={
                    periodEnd
                  }
                  onChange={(event) =>
                    setPeriodEnd(
                      event.target.value
                    )
                  }
                />

              </div>

              {/* DUE DATE */}

              <div className="invoice-field">

                <label>
                  Due Date
                </label>

                <input
                  type="date"
                  value={
                    dueDate
                  }
                  onChange={(event) =>
                    setDueDate(
                      event.target.value
                    )
                  }
                />

              </div>

            </div>

          </div>

          {/* =================================================
              3. TIME LOGS
          ================================================= */}

          <div className="invoice-section">

            <div className="section-title-row">

              <div>

                <h2>
                  3. Unbilled Time Logs
                </h2>

                <p>
                  Select the time logs
                  you want to include
                  in this invoice.
                </p>

              </div>

              <div className="selected-count">
                {selectedLogs.length}
                {" "}
                selected
              </div>

            </div>

            {/* NO CLIENT */}

            {!selectedClient ? (
              <div className="invoice-placeholder">

                Please select a
                client first.

              </div>

            ) : loadingLogs ? (

              /* LOADING */

              <div className="invoice-placeholder">

                Loading unbilled
                time logs...

              </div>

            ) : timeLogs.length ===
              0 ? (

              /* NO LOGS */

              <div className="invoice-placeholder">

                <h3>
                  No unbilled time
                  logs
                </h3>

                <p>
                  This client has no
                  completed unbilled
                  time logs.
                </p>

              </div>

            ) : (

              /* TIME LOG LIST */

              <div className="time-log-list">

                {timeLogs.map(
                  (log) => {

                    // ------------------------------------------------
                    // DURATION IN SECONDS
                    // ------------------------------------------------

                    const durationSeconds =
                      Number(
                        log.duration ||
                          0
                      );

                    // ------------------------------------------------
                    // HOURS FOR BILLING
                    // ------------------------------------------------

                    const hours =
                      durationSeconds /
                      3600;

                    // ------------------------------------------------
                    // HOURLY RATE
                    // ------------------------------------------------

                    const rate =
                      Number(
                        log.hourlyRate ||
                          0
                      );

                    // ------------------------------------------------
                    // AMOUNT
                    // ------------------------------------------------

                    const amount =
                      hours * rate;

                    // ------------------------------------------------
                    // SELECTED
                    // ------------------------------------------------

                    const isSelected =
                      selectedLogs.includes(
                        log._id
                      );

                    return (
                      <label
                        key={
                          log._id
                        }
                        className={
                          `time-log-card ${
                            isSelected
                              ? "selected"
                              : ""
                          }`
                        }
                      >

                        {/* CHECKBOX */}

                        <input
                          type="checkbox"
                          checked={
                            isSelected
                          }
                          onChange={() =>
                            toggleLog(
                              log._id
                            )
                          }
                        />

                        {/* INFO */}

                        <div className="time-log-info">

                          <div className="time-log-title">

                            {log.project
                              ?.name ||
                              "Project"}

                            {log.task
                              ?.title && (
                              <span>
                                {" "}
                                -{" "}
                                {
                                  log
                                    .task
                                    .title
                                }
                              </span>
                            )}

                          </div>

                          <div className="time-log-meta">

                            <span>
                              Start:{" "}
                              {formatDateTime(
                                log.startTime
                              )}
                            </span>

                            <span>
                              End:{" "}
                              {formatDateTime(
                                log.endTime
                              )}
                            </span>

                          </div>

                        </div>

                        {/* VALUES */}

                        <div className="time-log-values">

                          {/* -----------------------------------------
                              DURATION
                          ------------------------------------------ */}

                          <strong>
                            {formatDuration(
                              durationSeconds
                            )}
                          </strong>

                          {/* -----------------------------------------
                              RATE
                          ------------------------------------------ */}

                          <span>
                            {formatCurrency(
                              rate
                            )}
                            /hr
                          </span>

                          {/* -----------------------------------------
                              AMOUNT
                          ------------------------------------------ */}

                          <strong>
                            {formatCurrency(
                              amount
                            )}
                          </strong>

                        </div>

                      </label>
                    );
                  }
                )}

              </div>
            )}

          </div>

          {/* =================================================
              4. TAX
          ================================================= */}

          <div className="invoice-section">

            <h2>
              4. Tax
            </h2>

            <div className="invoice-field tax-field">

              <label>
                Tax Percentage
              </label>

              <div className="tax-input-wrapper">

                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={
                    taxPercent
                  }
                  onChange={
                    handleTaxChange
                  }
                />

                <span>
                  %
                </span>

              </div>

              <p className="invoice-help-text">
                Enter tax percentage
                between 0 and 100.
              </p>

            </div>

          </div>

          {/* =================================================
              SUMMARY
          ================================================= */}

          <div className="invoice-summary">

            <div className="invoice-summary-title">

              <Calculator
                size={21}
              />

              <h2>
                Invoice Summary
              </h2>

            </div>

            {/* SELECTED LOGS */}

            <div className="summary-row">

              <span>
                Selected Logs
              </span>

              <strong>
                {
                  selectedLogs.length
                }
              </strong>

            </div>

            {/* SUBTOTAL */}

            <div className="summary-row">

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

            <div className="summary-row">

              <span>
                Tax (
                {taxPercent || 0}
                %)
              </span>

              <strong>
                {formatCurrency(
                  taxAmount
                )}
              </strong>

            </div>

            {/* TOTAL */}

            <div className="summary-total">

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

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="invoice-actions">

            {/* CANCEL */}

            <button
              type="button"
              className="invoice-cancel-btn"
              onClick={() =>
                navigate(
                  "/invoices"
                )
              }
              disabled={saving}
            >
              Cancel
            </button>

            {/* SAVE */}

            <button
              type="submit"
              className="invoice-save-btn"
              disabled={
                saving ||
                !selectedClient ||
                selectedLogs.length ===
                  0
              }
            >

              <Save size={19} />

              {saving
                ? "Creating..."
                : "Create Invoice"}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default CreateInvoice;