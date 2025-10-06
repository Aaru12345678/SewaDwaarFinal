import React from "react";
import "./About.css";
import aboutImage from "../assets/about_image.png"; // replace with your image

const About = () => {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-text">
          <h1>About SewaDwaar</h1>
          <p>
            Our <strong>SewaDwaar</strong> is a modern digital platform designed
            to simplify the way citizens interact with government offices and
            departments. Whether you are booking an appointment online, making a
            walk-in visit, or seeking information about a particular
            organization, this app acts as a single gateway that connects people
            with government services in a transparent, efficient, and
            user-friendly manner.
          </p>
          <p>
            The primary purpose of this app is to bridge the gap between
            citizens and government institutions. Many citizens face challenges
            such as long queues, lack of information, or confusion about where
            to go and whom to meet. Our Visitors App solves these issues by
            offering an organized, smart, and transparent system for visitor
            management and government services access.
          </p>
        </div>
        <div className="about-image">
          <img src={aboutImage} alt="SewaDwaar Overview" />
        </div>
      </section>

      {/* Info Boxes */}
      <section className="about-boxes">
        <div className="box">
          <h3>📅 Easy Appointments</h3>
          <p>
            Citizens can book online or walk-in appointments, reducing waiting
            times and streamlining visits.
          </p>
        </div>
        <div className="box">
          <h3>ℹ️ Information Access</h3>
          <p>
            Get clear details about government offices, departments, and
            officials at one place.
          </p>
        </div>
        <div className="box">
          <h3>⚡ Smart Visitor Management</h3>
          <p>
            Transparent tracking of visitors and appointments makes the process
            smoother and more efficient.
          </p>
        </div>
        <div className="box">
          <h3>🔒 Secure & Reliable</h3>
          <p>
            Built with authentication and secure systems to keep your data safe
            and accessible only to you.
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
