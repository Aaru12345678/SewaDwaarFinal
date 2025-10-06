import React from "react";
import "./Help.css";

const Help = () => {
  return (
    <div className="help-page">
      <div className="help-container">
        <h1 className="help-title">Help & User Guide</h1>
        <p className="help-intro">
          Welcome to the <strong>Sewa Dwar</strong> — your hassle-free way to<em>schedule and manage government office visits.</em>Whether you’re booking ahead or walking in, the app keeps everything simple, fast, and transparent.
        </p>

        <p className="help-intro">
          The interface is clean and beginner-friendly, so you spend less time figuring things out and more time getting your work done.
Here’s what makes it easy:
        </p>

        {/* Feature Boxes */}
        <div className="help-features">
          <div className="feature-box">
            <h3>🌍 Multi-Language Support</h3>
            <p>Switch between Marathi, Hindi, and English to book appointments and read updates in the language you prefer.</p>
          </div>
          <div className="feature-box">
            <h3>🧭 Easy Navigation</h3>
            <p>Straightforward menus, clear department listings, and step-by-step booking—no guesswork, just tap and go.</p>
          </div>
          <div className="feature-box">
            <h3>♿ Accessibility Options</h3>
            <p>Adjust text size, enable high-contrast mode, and enjoy screen-reader compatibility for a smooth experience for all visitors.</p>
          </div>
          <div className="feature-box">
            <h3>⏱ Real-Time Updates</h3>
            <p>Get instant notifications when your appointment is approved, rescheduled, or completed.
Track live queue status and wait times right from your phone.</p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="help-footer-text">
          {/* <p>
            Whether you’re an administrator reviewing reports, a policy-maker shaping the future,
            or a citizen curious about government initiatives — this platform puts information
            at your fingertips.
          </p> */}
          <p>
            Need help? Visit our <strong><a href="/contact" className="contact-box">Contact Us</a></strong> or stop by the Help Desk at your chosen office, and a staff member will guide you through any step.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Help;
