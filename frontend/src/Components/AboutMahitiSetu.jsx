import React from "react";
import aboutImage from "../assets/canvabout.png"; // your image file
import "../css/AboutMahitiSetu.css";

export default function AboutSewaDwaar() {
  return (
    <section className="about-section">
      <div className="about-image-container">
        <img src={aboutImage} alt="About Sewa Dwaar" className="about-image" />

        {/* Title centered across the image; paragraphs left-aligned below it */}
        <div className="about-overlay" aria-hidden="false">
          <h2 className="about-title">ABOUT SEWA DWAAR</h2>

          <div className="about-text">
            <p>
              Our <strong>Sewa Dwaar</strong> is a modern digital platform designed to
              simplify the way citizens interact with government offices and departments.
              Whether you are booking an appointment online, making a walk-in visit, or
              seeking information about a particular organization, this app acts as a
              single gateway that connects people with government services in a transparent,
              efficient, and user-friendly manner.
            </p>

            <p>
              The primary purpose of this app is to bridge the gap between citizens and
              government institutions. Many citizens face challenges such as long queues,
              lack of information, or confusion about where to go and whom to meet. Our
              Visitors App solves these issues by offering an organized, smart, and
              transparent system for visitor management and government services access.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
