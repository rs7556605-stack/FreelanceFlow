import React, { useEffect, useState } from "react";
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  ArrowLeft,
  Search,
  Filter,
  MoreVertical,
  X,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import API from "../services/api";
import "./Invoices.css";

const Invoices = () => {
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [invoices, setInvoices] = useState([]);

  const [loading, setLoading] = useState(true);

  const [deletingId, setDeletingId] =
    useState(null);

  const [error, setError] = useState("");

  const [message, setMessage] =
    useState("");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [openMenuId, setOpenMenuId] =
    useState(null);

  // =====================================================
  // LOAD INVOICES
  // =====================================================

  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await API.get("/invoices");

      if (response.data.success) {
        setInvoices(
          response.data.invoices || []
        );
      } else {
        setError(
          response.data.message ||
            "Failed to load invoices."
        );
      }
    } catch (error) {
      console.error(
        "Load Invoices Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load invoices."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadInvoices();
  }, []);

  // =====================================================
  // CLOSE THREE DOT MENU
  // =====================================================

  useEffect(() => {
    const handleOutsideClick = () => {
      setOpenMenuId(null);
    };

    document.addEventListener(
      "click",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "click",
        handleOutsideClick
      );
    };
  }, []);

  // =====================================================
  // FORMAT CURRENCY
  // =====================================================

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "-";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // DELETE INVOICE
  // =====================================================

  const handleDeleteInvoice = async (
    invoice
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete invoice "${invoice.invoiceNumber}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(invoice._id);

      setError("");
      setMessage("");

      setOpenMenuId(null);

      const response =
        await API.delete(
          `/invoices/${invoice._id}`
        );

      if (response.data.success) {
        setInvoices(
          (previousInvoices) =>
            previousInvoices.filter(
              (item) =>
                item._id !==
                invoice._id
            )
        );

        setMessage(
          "Invoice deleted successfully."
        );
      } else {
        setError(
          response.data.message ||
            "Failed to delete invoice."
        );
      }
    } catch (error) {
      console.error(
        "Delete Invoice Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to delete invoice."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =====================================================
  // FILTER INVOICES
  // =====================================================

  const filteredInvoices =
    invoices.filter((invoice) => {
      const search =
        searchTerm
          .trim()
          .toLowerCase();

      const invoiceNumber =
        invoice.invoiceNumber
          ?.toLowerCase() || "";

      const clientName =
        invoice.client?.name
          ?.toLowerCase() || "";

      const status =
        invoice.status
          ?.toLowerCase() || "";

      const matchesSearch =
        !search ||
        invoiceNumber.includes(
          search
        ) ||
        clientName.includes(
          search
        ) ||
        status.includes(search);

      const matchesStatus =
        statusFilter === "all" ||
        status ===
          statusFilter.toLowerCase();

      return (
        matchesSearch &&
        matchesStatus
      );
    });

  // =====================================================
  // STATUS CLASS
  // =====================================================

  const getStatusClass = (status) => {
    if (!status) {
      return "invoice-status draft";
    }

    return `invoice-status ${status
      .toLowerCase()
      .replace(/\s+/g, "-")}`;
  };

  // =====================================================
  // CLEAR FILTER
  // =====================================================

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="invoices-page">

      <div className="invoices-container">

        {/* =================================================
            BACK BUTTON
        ================================================= */}

        <button
          type="button"
          className="invoices-back-btn"
          onClick={() =>
            navigate("/")
          }
        >
          <ArrowLeft size={18} />

          <span>
            Back to Dashboard
          </span>
        </button>

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="invoices-header">

          <div className="invoices-title-area">

            <div className="invoices-title-row">

              <h1>
                Invoices
              </h1>

              <span className="invoice-count">
                {invoices.length}
              </span>

            </div>

            <p>
              Manage your client
              invoices
            </p>

          </div>

          <Link
            to="/invoices/create"
            className="create-invoice-btn"
          >
            <Plus size={20} />

            <span>
              Create Invoice
            </span>
          </Link>

        </div>

        {/* =================================================
            ERROR MESSAGE
        ================================================= */}

        {error && (
          <div className="invoice-alert invoice-error">

            <span>
              {error}
            </span>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
            >
              <X size={16} />
            </button>

          </div>
        )}

        {/* =================================================
            SUCCESS MESSAGE
        ================================================= */}

        {message && (
          <div className="invoice-alert invoice-success">

            <span>
              {message}
            </span>

            <button
              type="button"
              onClick={() =>
                setMessage("")
              }
            >
              <X size={16} />
            </button>

          </div>
        )}

        {/* =================================================
            SEARCH + FILTER
        ================================================= */}

        {!loading &&
          invoices.length > 0 && (
            <div className="invoice-toolbar">

              {/* SEARCH */}

              <div className="invoice-search-box">

                <Search size={18} />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(
                      event.target.value
                    )
                  }
                  placeholder="Search invoice or client..."
                />

                {searchTerm && (
                  <button
                    type="button"
                    className="clear-search-btn"
                    onClick={() =>
                      setSearchTerm("")
                    }
                  >
                    <X size={16} />
                  </button>
                )}

              </div>

              {/* STATUS FILTER */}

              <div className="invoice-filter-box">

                <Filter size={17} />

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value
                    )
                  }
                >
                  <option value="all">
                    All Status
                  </option>

                  <option value="draft">
                    Draft
                  </option>

                  <option value="sent">
                    Sent
                  </option>

                  <option value="paid">
                    Paid
                  </option>

                  <option value="pending">
                    Pending
                  </option>

                  <option value="overdue">
                    Overdue
                  </option>
                </select>

              </div>

            </div>
          )}

        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (
          <div className="invoice-loading">

            <div className="invoice-spinner"></div>

            <p>
              Loading invoices...
            </p>

          </div>

        ) : invoices.length === 0 ? (

          /* =================================================
              EMPTY
          ================================================= */

          <div className="invoice-empty">

            <div className="invoice-empty-icon">
              <Plus size={30} />
            </div>

            <h2>
              No invoices yet
            </h2>

            <p>
              Create your first invoice
              from unbilled time logs.
            </p>

            <Link
              to="/invoices/create"
              className="create-invoice-btn"
            >
              <Plus size={20} />

              Create Invoice
            </Link>

          </div>

        ) : filteredInvoices.length === 0 ? (

          /* =================================================
              NO RESULTS
          ================================================= */

          <div className="invoice-empty">

            <div className="invoice-empty-icon">
              <Search size={28} />
            </div>

            <h2>
              No invoices found
            </h2>

            <p>
              Try changing your search
              or status filter.
            </p>

            <button
              type="button"
              className="invoice-clear-filter-btn"
              onClick={
                clearFilters
              }
            >
              Clear Filters
            </button>

          </div>

        ) : (

          /* =================================================
              INVOICE TABLE
          ================================================= */

          <div className="invoice-table-wrapper">

            <table className="invoice-table">

              <thead>

                <tr>

                  <th>
                    Invoice
                  </th>

                  <th>
                    Client
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Total
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredInvoices.map(
                  (invoice) => (

                    <tr
                      key={
                        invoice._id
                      }
                    >

                      {/* INVOICE */}

                      <td
                        data-label="Invoice"
                      >
                        <strong>
                          {invoice.invoiceNumber ||
                            "-"}
                        </strong>
                      </td>

                      {/* CLIENT */}

                      <td
                        data-label="Client"
                      >
                        <span className="invoice-client-name">
                          {invoice.client
                            ?.name ||
                            "Unknown Client"}
                        </span>
                      </td>

                      {/* DATE */}

                      <td
                        data-label="Date"
                      >
                        {formatDate(
                          invoice.invoiceDate
                        )}
                      </td>

                      {/* STATUS */}

                      <td
                        data-label="Status"
                      >
                        <span
                          className={getStatusClass(
                            invoice.status
                          )}
                        >
                          {invoice.status ||
                            "Draft"}
                        </span>
                      </td>

                      {/* TOTAL */}

                      <td
                        data-label="Total"
                      >
                        <strong>
                          {formatCurrency(
                            invoice.total
                          )}
                        </strong>
                      </td>

                      {/* =================================================
                          ACTION
                      ================================================= */}

                      <td
                        data-label="Action"
                        className="invoice-action-cell"
                      >

                        <div className="invoice-action-wrapper">

                          {/* VIEW */}

                          <Link
                            to={`/invoices/${invoice._id}`}
                            className="view-invoice-btn"
                            title="View Invoice"
                          >
                            <Eye
                              size={17}
                            />

                            <span>
                              View
                            </span>
                          </Link>

                          {/* THREE DOT */}

                          <div
                            className="invoice-menu-wrapper"
                            onClick={(
                              event
                            ) =>
                              event.stopPropagation()
                            }
                          >

                            <button
                              type="button"
                              className="invoice-menu-btn"
                              title="More actions"
                              onClick={() =>
                                setOpenMenuId(
                                  openMenuId ===
                                    invoice._id
                                    ? null
                                    : invoice._id
                                )
                              }
                            >
                              <MoreVertical
                                size={20}
                              />
                            </button>

                            {/* DROPDOWN */}

                            {openMenuId ===
                              invoice._id && (

                              <div className="invoice-dropdown">

                                {/* EDIT */}

                                <Link
                                  to={`/invoices/${invoice._id}/edit`}
                                  className="invoice-dropdown-edit"
                                  onClick={() =>
                                    setOpenMenuId(
                                      null
                                    )
                                  }
                                >
                                  <Pencil
                                    size={16}
                                  />

                                  <span>
                                    Edit
                                  </span>
                                </Link>

                                {/* DELETE */}

                                <button
                                  type="button"
                                  className="invoice-dropdown-delete"
                                  onClick={() =>
                                    handleDeleteInvoice(
                                      invoice
                                    )
                                  }
                                  disabled={
                                    deletingId ===
                                    invoice._id
                                  }
                                >
                                  <Trash2
                                    size={16}
                                  />

                                  <span>
                                    {deletingId ===
                                    invoice._id
                                      ? "Deleting..."
                                      : "Delete"}
                                  </span>
                                </button>

                              </div>

                            )}

                          </div>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
};

export default Invoices;