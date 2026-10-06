import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./Contact.css";

const Contact = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setStatusMessage("");
    setError("");

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Please fill all fields.");
      return;
    }

    try {
      setLoading(true);

      const response = await API.post("/contact", {
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
      });

      if (response.data.success) {
        setStatusMessage("Message sent successfully!");

        setName("");
        setEmail("");
        setMessage("");
      }
    } catch (error) {
      console.error("Contact Form Error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to send message. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="contact-section">

      {/* Back Button */}
      <button
        type="button"
        className="contact-back-button"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      <h2>Contact Me</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Name</label>

          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter your name"
            disabled={loading}
          />
        </div>

        <div>
          <label>Email</label>

          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email"
            disabled={loading}
          />
        </div>

        <div>
          <label>Message</label>

          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Enter your message"
            rows="5"
            disabled={loading}
          />
        </div>

        {statusMessage && (
          <p className="contact-success-message">
            {statusMessage}
          </p>
        )}

        {error && (
          <p className="contact-error-message">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Message"}
        </button>
      </form>
    </section>
  );
};

export default Contact;