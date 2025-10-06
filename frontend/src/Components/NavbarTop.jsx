import React from "react";
import "../css/NavbarTop.css";

import logo5 from "../assets/logo5.png";
import logo00 from "../assets/logo00.png";
import flag from "../assets/flag.png";

const NavbarTop = () => {
  return (
   <div className="top-navbar">
  <div className="left-logos">
    {/* <img src={flag} alt="Logo 2" /> */}
    {/* <span className="site-name">MahitiSetu</span> */}
  </div>
  <div className="right-logo">
    {/* <img src={logo5} alt="Logo 2" /> */}
  </div>
</div>
  );
};

export default NavbarTop;