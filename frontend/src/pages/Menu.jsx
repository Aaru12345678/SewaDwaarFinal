
import React, { useEffect, useState } from 'react';
// import { getStates, getDivisions, getDistricts, getTalukas } from '../services/api.ts';
import { getStates, getDivisions, getDistricts, getTalukas } from '../services/api.jsx';

import { Box, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import Typography from '@mui/material/Typography';
import "../css/Dashboard.css"

const SimpleDropdownRow = () => {
  const [val1, setVal1] = useState("");
  const [val2, setVal2] = useState("");
  const [val3, setVal3] = useState("");
  const [val4, setVal4] = useState("");
  const [val5, setVal5] = useState("");

  const options = ["One", "Two", "Three"];

  const [selectedState, setSelectedState] = useState('');
const [selectedDivision, setSelectedDivision] = useState('');
const [selectedDistrict, setSelectedDistrict] = useState('');
const [selectedTaluka, setSelectedTaluka] = useState('');

const [states, setStates] = useState([]);
const [divisions, setDivisions] = useState([]);
const [districts, setDistricts] = useState([]);
const [talukas, setTalukas] = useState([]);


// Load States Initially
// useEffect(() => {
//   const fetchStates = async () => {
//     const { data } = await getStates();
//     if (data) setStates(data);
//   };
//   fetchStates();
// }, []);

// // When a State is Selected → Load Divisions
// useEffect(() => {
//   if (selectedState) {
//     const fetchDivisions = async () => {
//       const { data } = await getDivisions(selectedState);
//       if (data) setDivisions(data);
//       setDistricts([]);
//       setTalukas([]);
//       setSelectedDivision('');
//       setSelectedDistrict('');
//     };
//     fetchDivisions();
//   }
// }, [selectedState]);


// // When a Division is Selected → Load Districts
// useEffect(() => {
//   if (selectedDivision) {
//     const fetchDistricts = async () => {
//       const { data } = await getDistricts(selectedState, selectedDivision);
//       if (data) setDistricts(data);
//       setTalukas([]);
//       setSelectedDistrict('');
//     };
//     fetchDistricts();
//   }
// }, [selectedDivision]);

// // When a District is Selected → Load Talukas
// useEffect(() => {
//   if (selectedDistrict) {
//     const fetchTalukas = async () => {
//       const { data } = await getTalukas(selectedState, selectedDivision, selectedDistrict);
//       if (data) setTalukas(data);
//     };
//     fetchTalukas();
//   }
// }, [selectedDistrict]);

useEffect(() => {
  getStates().then((res) => {
    if (res.data) setStates(res.data);
  });
}, []);

useEffect(() => {
  if (selectedState) {
    getDivisions(selectedState).then((res) => {
      if (res.data) setDivisions(res.data);
      setDistricts([]);
      setTalukas([]);
      setSelectedDivision('');
      setSelectedDistrict('');
      setSelectedTaluka('');
    });
  }
}, [selectedState]);

useEffect(() => {
  if (selectedDivision) {
    getDistricts(selectedState, selectedDivision).then((res) => {
      if (res.data) setDistricts(res.data);
      setTalukas([]);
      setSelectedDistrict('');
      setSelectedTaluka('');
    });
  }
}, [selectedDivision]);

useEffect(() => {
  if (selectedDistrict) {
    getTalukas(selectedState, selectedDivision, selectedDistrict).then((res) => {
      if (res.data) setTalukas(res.data);
      setSelectedTaluka('');
    });
  }
}, [selectedDistrict]);

  return (
    // 
    <>
    <Box height={20}/>
    <div className="dropdown-row">
  <div className="dropdown-group">
    <label>State</label>
    <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)}>
      <option value="">Select State</option>
      {states.map((s) => (
        <option key={s.state_code} value={s.state_code}>
          {s.state_name}
        </option>
      ))}
    </select>
  </div>

  <div className="dropdown-group">
    <label>Division</label>
    <select
      value={selectedDivision}
      onChange={(e) => setSelectedDivision(e.target.value)}
      disabled={!divisions.length}
    >
      <option value="">Select Division</option>
      {divisions.map((d) => (
        <option key={d.division_code} value={d.division_code}>
          {d.division_name}
        </option>
      ))}
    </select>
  </div>

  <div className="dropdown-group">
    <label>District</label>
    <select
      value={selectedDistrict}
      onChange={(e) => setSelectedDistrict(e.target.value)}
      disabled={!districts.length}
    >
      <option value="">Select District</option>
      {districts.map((d) => (
        <option key={d.district_code} value={d.district_code}>
          {d.district_name}
        </option>
      ))}
    </select>
  </div>

  <div className="dropdown-group">
    <label>Taluka</label>
    <select
      value={selectedTaluka}
      onChange={(e) => setSelectedTaluka(e.target.value)}
      disabled={!talukas.length}
    >
      <option value="">Select Taluka</option>
      {talukas.map((t) => (
        <option key={t.taluka_code} value={t.taluka_code}>
          {t.taluka_name}
        </option>
      ))}
    </select>
  </div>
</div>

    </>
  );
};

export default SimpleDropdownRow;
