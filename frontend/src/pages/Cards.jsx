import React from "react";

const Cards = ({ number, label }) => {
  return (
    <div className="card">
      <h2>{number}</h2>
      <p>{label}</p>
    </div>
  );
};

export default Cards;
