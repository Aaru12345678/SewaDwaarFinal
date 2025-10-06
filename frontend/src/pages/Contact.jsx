import React, { useState } from "react";
import "./Contact.css";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState(null); // null | "success" | "error"

  const handleChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, email, message } = form;
    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus("error");
      return;
    }

    // simulate success (replace with real API call if you have one)
    setStatus("success");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <div className="hero-text">
          <h1>Contact Sewa Dwar</h1>
          <p>
            Have questions about the platform, data, or access? Drop us a
            message — we’ll get back quickly. Use the form or reach the people
            below directly.
          </p>
        </div>
        <div className="hero-cta">
          <div className="quick-email">
            <div className="emoji">📧</div>
            <div>
              <div className="label">General Email</div>
              <a href="mailto:collector.mumbaicity@maharashtra.gov.in">collector.mumbaicity@maharashtra.gov.in</a>
            </div>
          </div>

          <div className="quick-phone">
            <div className="emoji">📞</div>
            <div>
              <div className="label">Helpline</div>
              <a href="tel:022-22665233, 22662440">022-22665233, 22662440</a>
            </div>
          </div>
        </div>
      </div>

      <div className="contact-grid">
        {/* left: contact persons */}
        <aside className="contact-card">
          <h2>Contact To</h2>

          <p>This website is designed & developed by National Informatics Center and maintained by District Administration Mumbai City, Government of Maharashtra.

In case you have any query regarding this website, you may write to the Web Information Manager at  collector.mumbaicity[at]maharashtra[dot]gov[dot]in

Any feedback, related to content, design, or technology may be submitted at Message Section</p>

          <div className="note">
            <strong>Office:</strong> Collectorate Office, Mumbai<br />
            <strong>Hours:</strong> Mon–Fri, 9:30 AM – 6:00 PM
          </div>
        </aside>

        {/* right: contact form */}
        <form className="contact-form" onSubmit={handleSubmit} noValidate>
          <h2>Send us a message</h2>

          <label>
            Name
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your name"
              required
            />
          </label>

          <label>
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            Message
            <textarea
              name="message"
              rows="6"
              value={form.message}
              onChange={handleChange}
              placeholder="Tell us about your question or feedback..."
              required
            />
          </label>

          <div className="form-actions">
            <button type="submit" className="btn-send">
              Send Message
            </button>

            {status === "success" && (
              <div className="form-note success">Thanks — message sent!</div>
            )}
            {status === "error" && (
              <div className="form-note error">Please fill all fields.</div>
            )}
          </div>
        </form>
      </div>

      {/* bottom highlights — same boxes as About page */}
      <section className="contact-highlights">
        <div className="highlight">
          <div className="hi-emoji">📊</div>
          <h4>Interactive Charts</h4>
          <p>Explore 2D & 3D visualizations for quick insights.</p>
        </div>
        <div className="highlight">
          <div className="hi-emoji">🌍</div>
          <h4>Local Insights</h4>
          <p>District-wise & area-specific analytics that matter.</p>
        </div>
        <div className="highlight">
          <div className="hi-emoji">🔒</div>
          <h4>Secure Access</h4>
          <p>Role-based authentication and encrypted connections.</p>
        </div>
      </section>
    </div>
  );
};

export default Contact;
