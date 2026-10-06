import React, { useEffect, useState } from "react";
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import API from "../services/api";
import "./Invoices.css";

const Invoices = () => {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // =====================================================
  // LOAD INVOICES
  // =====================================================

  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/invoices");

      if (response.data.success) {
        setInvoices(
          response.data.invoices || []
        );
      }
    } catch (error) {
      console.error(
        "Load Invoices Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load invoices"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

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
      "en-IN"
    );
  };

  // =====================================================
  // DELETE INVOICE
  // =====================================================

  const handleDeleteInvoice = async (invoice) => {
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

      const response = await API.delete(
        `/invoices/${invoice._id}`
      );

      if (response.data.success) {
        setInvoices((previousInvoices) =>
          previousInvoices.filter(
            (item) =>
              item._id !== invoice._id
          )
        );

        setMessage(
          "Invoice deleted successfully."
        );
      }
    } catch (error) {
      console.error(
        "Delete Invoice Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to delete invoice"
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="invoices-page">

      <div className="invoices-container">

        {/* =================================================
            BACK BUTTON
        ================================================= */}

        <button
          type="button"
          className="invoices-back-btn"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="invoices-header">

          <div>
            <h1>Invoices</h1>

            <p>
              Manage your client invoices
            </p>
          </div>

          <Link
            to="/invoices/create"
            className="create-invoice-btn"
          >
            <Plus size={20} />
            Create Invoice
          </Link>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="invoice-error">
            {error}
          </div>
        )}

        {/* =================================================
            SUCCESS
        ================================================= */}

        {message && (
          <div className="invoice-success">
            {message}
          </div>
        )}

        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (
          <div className="invoice-loading">
            Loading invoices...
          </div>
        ) : invoices.length === 0 ? (
          <div className="invoice-empty">

            <h2>
              No invoices yet
            </h2>

            <p>
              Create your first invoice from
              unbilled time logs.
            </p>

            <Link
              to="/invoices/create"
              className="create-invoice-btn"
            >
              <Plus size={20} />
              Create Invoice
            </Link>

          </div>
        ) : (
          <div className="invoice-table-wrapper">

            <table className="invoice-table">

              <thead>

                <tr>
                  <th>Invoice</th>
                  <th>Client</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>

              </thead>

              <tbody>

                {invoices.map((invoice) => (

                  <tr key={invoice._id}>

                    {/* INVOICE */}

                    <td>
                      <strong>
                        {invoice.invoiceNumber}
                      </strong>
                    </td>

                    {/* CLIENT */}

                    <td>
                      {invoice.client?.name ||
                        "Unknown Client"}
                    </td>

                    {/* DATE */}

                    <td>
                      {formatDate(
                        invoice.invoiceDate
                      )}
                    </td>

                    {/* STATUS */}

                    <td>

                      <span
                        className={`invoice-status ${
                          invoice.status?.toLowerCase()
                        }`}
                      >
                        {invoice.status}
                      </span>

                    </td>

                    {/* TOTAL */}

                    <td>
                      <strong>
                        {formatCurrency(
                          invoice.total
                        )}
                      </strong>
                    </td>

                    {/* ACTIONS */}

                    <td>

                      <div className="invoice-action-buttons">

                        {/* VIEW */}

                        <Link
                          to={`/invoices/${invoice._id}`}
                          className="view-invoice-btn"
                          title="View Invoice"
                        >
                          <Eye size={17} />
                          View
                        </Link>

                        {/* EDIT */}

                        <Link
                          to={`/invoices/${invoice._id}/edit`}
                          className="edit-invoice-btn"
                          title="Edit Invoice"
                        >
                          <Pencil size={17} />
                          Edit
                        </Link>

                        {/* DELETE */}

                        <button
                          type="button"
                          className="delete-invoice-btn"
                          title="Delete Invoice"
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
                          <Trash2 size={17} />

                          {deletingId ===
                          invoice._id
                            ? "Deleting..."
                            : "Delete"}
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
};

export default Invoices;