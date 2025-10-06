import React from 'react';
import '../css/Header.css';
import emblem from '../assets/emblem2.png';
import applogo from "../assets/SewadwaarLogo1.png";
// make sure the path matches your project

const Header = () => {
  return (
    <header className="govt-header">
      <div className="header-left">
        {/* Black emblem */}
        <img src={emblem} alt="Government Emblem" className="govt-icon black-emblem" />

        <div className="govt-text-inline">
          <span className="eng-text">Government of Maharashtra | </span>
          <span className="mar-text">महाराष्ट्र शासन</span>

        <div className="header-right">
          <img src={applogo} alt="Government Emblem" className="app-icon black-emblem" />

        </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
