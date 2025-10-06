import React, { useRef, useState } from "react";
import Slider from "react-slick";
import "../css/BannerSlider.css";

import banner1 from "../assets/dwaar2.png";
import banner2 from "../assets/dwaar2.png";
import banner3 from "../assets/dwaar2.png";


const BannerSlider = () => {
  const sliderRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  const settings = {
    dots: true,
    infinite: true,
    autoplay: !isPaused,
    autoplaySpeed: 4000,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    pauseOnHover: false,
    pauseOnFocus: false,
    pauseOnDotsHover: false,
  };

  const handlePause = () => setIsPaused(!isPaused);
  const handleNext = () => sliderRef.current.slickNext();
  const handlePrev = () => sliderRef.current.slickPrev();

  return (
    <div className="banner-slider">
      <Slider ref={sliderRef} {...settings}>
        <div className="banner-slide">
          <img src={banner1} alt="Banner 1" />
        </div>
        <div className="banner-slide">
          <img src={banner2} alt="Banner 2" />
        </div>
        <div className="banner-slide">
          <img src={banner3} alt="Banner 3" />
        </div>
      </Slider>

      <div className="slider-controls">
        <button onClick={handlePrev}>⟨ Prev</button>
        <button onClick={handlePause}>
          {isPaused ? "Play" : "Pause"}
        </button>
        <button onClick={handleNext}>Next ⟩</button>
      </div>
    </div>
  );
};

export default BannerSlider;

