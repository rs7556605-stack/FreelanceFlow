import React from "react";
import { ArrowLeft, Check, Crown, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Upgrade.css";

const Upgrade = () => {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    navigate("/billing");
  };

  return (
    <div className="upgrade-page">
      <div className="upgrade-container">

        <button
          type="button"
          className="upgrade-back-btn"
          onClick={() => navigate("/clients")}
        >
          <ArrowLeft size={18} />
          <span>Back to Clients</span>
        </button>

        <div className="upgrade-hero">
          <div className="upgrade-icon">
            <Crown size={28} />
          </div>

          <span className="upgrade-badge">
            Upgrade Your Plan
          </span>

          <h1>
            Unlock Unlimited Clients
          </h1>

          <p>
            Upgrade your plan and remove the 2-client limit.
            Manage unlimited clients, projects and freelance work
            without restrictions.
          </p>
        </div>

        <div className="upgrade-plans">

          <div className="upgrade-plan-card free-plan">
            <div className="plan-card-top">
              <div>
                <span className="plan-label">
                  CURRENT PLAN
                </span>

                <h2>Free</h2>
              </div>

              <div className="plan-icon">
                <Zap size={21} />
              </div>
            </div>

            <div className="plan-price">
              <strong>₹0</strong>
              <span>/ month</span>
            </div>

            <div className="plan-limit">
              2 clients maximum
            </div>

            <div className="plan-features">
              <div>
                <Check size={17} />
                <span>Up to 2 clients</span>
              </div>

              <div>
                <Check size={17} />
                <span>Client management</span>
              </div>

              <div>
                <Check size={17} />
                <span>Projects management</span>
              </div>

              <div>
                <Check size={17} />
                <span>Invoices</span>
              </div>
            </div>

            <button
              type="button"
              className="current-plan-btn"
              disabled
            >
              Current Plan
            </button>
          </div>

          <div className="upgrade-plan-card pro-plan">

            <div className="popular-badge">
              MOST POPULAR
            </div>

            <div className="plan-card-top">
              <div>
                <span className="plan-label">
                  PREMIUM PLAN
                </span>

                <h2>Pro</h2>
              </div>

              <div className="plan-icon pro-icon">
                <Crown size={21} />
              </div>
            </div>

            <div className="plan-price">
              <strong>₹299</strong>
              <span>/ month</span>
            </div>

            <div className="plan-limit unlimited">
              Unlimited clients
            </div>

            <div className="plan-features">

              <div>
                <Check size={17} />
                <span>Unlimited clients</span>
              </div>

              <div>
                <Check size={17} />
                <span>Unlimited projects</span>
              </div>

              <div>
                <Check size={17} />
                <span>Unlimited invoices</span>
              </div>

              <div>
                <Check size={17} />
                <span>Advanced client management</span>
              </div>

              <div>
                <Check size={17} />
                <span>Priority features</span>
              </div>

            </div>

            <button
              type="button"
              className="upgrade-now-btn"
              onClick={handleUpgrade}
            >
              <Crown size={18} />
              Upgrade to Pro
            </button>

          </div>

        </div>

        <div className="upgrade-bottom-note">
          <span>🔒</span>
          <p>
            Secure billing. You can manage your subscription
            anytime from the billing page.
          </p>
        </div>

      </div>
    </div>
  );
};

export default Upgrade;
