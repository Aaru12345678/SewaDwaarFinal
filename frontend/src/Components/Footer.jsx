import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";
import nicLogo from "../assets/nic.png"; 
import digitalIndiaLogo from "../assets/digital_india.png"; 
import darshanLogo from "../assets/SewadwaarLogo1.png";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Left: Logo + Description */}
        <div className="footer-section footer-logo">
          <img src={darshanLogo} alt="Darshan Logo" className="darshan-img" />
          <p>
            SewaDwaar is an initiative by the Government of Maharashtra to enable 
            citizens to conveniently book appointments and access government services seamlessly.
          </p>
        </div>

        {/* Middle: Important Links */}
        <div className="footer-section">
          <h3>Important Links</h3>
          <ul>
            <li><Link to="/login">Login</Link></li>
          </ul>
        </div>

        {/* Middle: Quick Links */}
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/about">About</Link></li>
          </ul>
        </div>

        {/* Right: Contact */}
        <div className="footer-section">
          <h3>Contact</h3>
          <ul>
            <li><Link to="/help">Help</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>
        </div>
      </div>

      {/* Info Section */}
      <div className="footer-middle">
        <p>
          Content of SewaDwaar is published, managed and owned by Respective Departments, Government of India.
        </p>
        <p>
          © NIC, Developed and hosted by{" "}
          <a
            href="https://www.nic.in/"
            target="_blank"
            rel="noopener noreferrer"
          >
            National Informatics Centre
          </a>
          {" "}and{" "}
          <a
            href="https://www.meity.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ministry of Electronics & Information Technology
          </a>
          , Government of India
        </p>
      </div>

      {/* Logos + Copyright */}
      <div className="footer-bottom">
        <div className="footer-logos">
          <img src={nicLogo} alt="NIC" />
          <img src={digitalIndiaLogo} alt="Digital India" />
        </div>
        <p>© {new Date().getFullYear()} SewaDwaar Initiative</p>
      </div>
    </footer>
  );
};

export default Footer;
