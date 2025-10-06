

import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../Components/Header';
import NavbarMain from '../Components/NavbarMain';
import Footer from '../Components/Footer';
import './MainPage.css';
import NavbarTop from '../Components/NavbarTop';


export default function MainPage() {
  return (
    <div className="main-layout">
      {/* Header */}
      <div className="fixed-header">
        <NavbarTop/>
        <Header />
        <NavbarMain />
      </div>

      {/* Middle Content */}
      <div className="content-below">
        <Outlet />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
