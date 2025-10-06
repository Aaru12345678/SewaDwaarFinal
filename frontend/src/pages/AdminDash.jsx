import React, { useEffect, useState, useCallback } from "react";
import {
  getStates,
  getDivisions,
  getDistricts,
  getTalukas,
  // fetchSchemes,
  // fetchSchemeStructure,
  // getDashboardData,
  // getTimeSeriesData,
} from "../services/api";
// import Charts from "../Components/Charts";
import { Box, Typography, Grid, Skeleton, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import WelcomeBanner from "../Components/WelcomeBanner";
// import FilterPanel from "../Components/FilterPanel";
// import EmptyState from "../Components/EmptyState";

export default function AdminDashboard() {
  const [states, setStates] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [talukas, setTalukas] = useState([]);
  const [schemes, setSchemes] = useState([]);

  const [selectedState, setSelectedState] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedTaluka, setSelectedTaluka] = useState("");
  const [selectedScheme, setSelectedScheme] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [dashboardData, setDashboardData] = useState(null);
  const [timeSeriesData, setTimeSeriesData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isTimeSeries, setIsTimeSeries] = useState(false);

  const [schemeFrequency, setSchemeFrequency] = useState(null);
  const [dailyMonth, setDailyMonth] = useState("");
  const [dailyStartDate, setDailyStartDate] = useState("");
  const [dailyEndDate, setDailyEndDate] = useState("");
  const [weeklyStartDate, setWeeklyStartDate] = useState("");
  const [weeklyEndDate, setWeeklyEndDate] = useState("");
  const [yearStart, setYearStart] = useState("");
  const [yearEnd, setYearEnd] = useState("");
  const [periods, setPeriods] = useState([]);

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
  const months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];

  // **MODIFIED**: Initial data load with auto-location from localStorage
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      try {
        const [schemeRes, stateRes] = await Promise.all([
          // fetchSchemes(),
           getStates()]);
        // setSchemes(schemeRes?.data || []);
        setStates(stateRes?.data || []);

        // Auto-location feature
        const lsState = localStorage.getItem("state_code") || "";
        const lsDivision = localStorage.getItem("division_code") || "";
        const lsDistrict = localStorage.getItem("district_code") || "";
        const lsTaluka = localStorage.getItem("taluka_code") || "";

        if (lsState) {
          setSelectedState(lsState);
          const divisionRes = await getDivisions(lsState);
          setDivisions(divisionRes.data || []);
          
          if (lsDivision) {
            setSelectedDivision(lsDivision);
            const districtRes = await getDistricts(lsState, lsDivision);
            setDistricts(districtRes.data || []);

            if (lsDistrict) {
              setSelectedDistrict(lsDistrict);
              const talukaRes = await getTalukas(lsState, lsDivision, lsDistrict);
              setTalukas(talukaRes.data || []);
              
              if (lsTaluka) {
                setSelectedTaluka(lsTaluka);
              }
            }
          }
        }
      } catch {
        setError("Failed to load initial data.");
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, []);

  // Cascading selects
  useEffect(() => {
    if (!selectedState || localStorage.getItem("division_code")) return;
    getDivisions(selectedState).then((res) => {
      setDivisions(res.data || []);
      setSelectedDivision("");
      setDistricts([]);
      setTalukas([]);
    });
  }, [selectedState]);

  useEffect(() => {
    if (!selectedDivision || localStorage.getItem("district_code")) return;
    getDistricts(selectedState, selectedDivision).then((res) => {
      setDistricts(res.data || []);
      setSelectedDistrict("");
      setTalukas([]);
    });
  }, [selectedDivision, selectedState]);

  useEffect(() => {
    if (!selectedDistrict || localStorage.getItem("taluka_code")) return;
    getTalukas(selectedState, selectedDivision, selectedDistrict).then((res) => {
      setTalukas(res.data || []);
      setSelectedTaluka("");
    });
  }, [selectedDistrict, selectedDivision, selectedState]);

  // When scheme changes, fetch frequency
  // useEffect(() => {
  //   if (!selectedScheme) {
  //     setSchemeFrequency(null);
  //     setPeriods([]);
  //     return;
  //   }
  //   let cancelled = false;
  //   (async () => {
  //     try {
  //       const resp = await fetchSchemeStructure(selectedScheme);
  //       if (cancelled) return;
  //       setSchemeFrequency(resp?.data?.frequency ?? null);
  //       setDailyMonth("");
  //       setDailyStartDate("");
  //       setDailyEndDate("");
  //       setWeeklyStartDate("");
  //       setWeeklyEndDate("");
  //       setYearStart("");
  //       setYearEnd("");
  //       setPeriods([]);
  //     } catch (err) {
  //       console.error("Failed to fetch scheme structure:", err);
  //       setSchemeFrequency(null);
  //     }
  //   })();
  //   return () => { cancelled = true; };
  // }, [selectedScheme]);

  // Helper functions for period computation
  const pad = (n) => String(n).padStart(2, "0");
  const dateToYYYYMMDD = (d) => {
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return null;
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
  };

  function datesBetween(startISO, endISO) {
    const list = [];
    const cur = new Date(startISO);
    const end = new Date(endISO);
    if (isNaN(cur) || isNaN(end) || cur > end) return list;
    while (cur <= end) {
      list.push(dateToYYYYMMDD(new Date(cur)));
      cur.setDate(cur.getDate() + 1);
    }
    return list;
  }

  function mondayOf(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = ((day + 6) % 7);
    d.setDate(d.getDate() - diff);
    return dateToYYYYMMDD(d);
  }

  function weeksBetween(startISO, endISO) {
    const weeks = [];
    const startMon = mondayOf(startISO);
    const endMon = mondayOf(endISO);
    if (!startMon || !endMon) return weeks;
    let cur = new Date(startMon);
    const last = new Date(endMon);
    while (cur <= last) {
      weeks.push(dateToYYYYMMDD(cur));
      cur.setDate(cur.getDate() + 7);
    }
    return weeks;
  }

  function yearsBetween(startYear, endYear) {
    const ys = [];
    const s = Number(startYear);
    const e = Number(endYear);
    if (!s || !e || s > e) return ys;
    for (let y = s; y <= e; y++) ys.push(String(y));
    return ys;
  }

  // Compute periods reactively
  useEffect(() => {
    if (schemeFrequency === "Daily") {
      if (!dailyMonth) { setPeriods([]); return; }
      const nowYear = year || new Date().getFullYear();
      let start = dailyStartDate || `${nowYear}-${dailyMonth}-01`;
      if (!dailyEndDate) {
        const last = new Date(nowYear, Number(dailyMonth), 0).getDate();
        const end = `${nowYear}-${dailyMonth}-${pad(last)}`;
        setDailyStartDate(start);
        setDailyEndDate(end);
        setPeriods(datesBetween(start, end));
      } else {
        const last = new Date(nowYear, Number(dailyMonth), 0).getDate();
        const monthStart = `${nowYear}-${dailyMonth}-01`;
        const monthEnd = `${nowYear}-${dailyMonth}-${pad(last)}`;
        const s = dateToYYYYMMDD(dailyStartDate) || monthStart;
        const e = dateToYYYYMMDD(dailyEndDate) || monthEnd;
        const sClamped = new Date(s) < new Date(monthStart) ? monthStart : s;
        const eClamped = new Date(e) > new Date(monthEnd) ? monthEnd : e;
        setPeriods(datesBetween(sClamped, eClamped));
      }
    } else if (schemeFrequency === "Weekly") {
      if (!weeklyStartDate || !weeklyEndDate) { setPeriods([]); return; }
      const s = dateToYYYYMMDD(weeklyStartDate);
      const e = dateToYYYYMMDD(weeklyEndDate);
      setPeriods(weeksBetween(s, e).map(m => `week_${m}`));
    } else if (schemeFrequency === "Monthly") {
      if (!month || !year) { setPeriods([]); return; }
      setPeriods([`${year}-${month}`]);
    } else if (schemeFrequency === "Yearly") {
      if (!yearStart || !yearEnd) { setPeriods([]); return; }
      setPeriods(yearsBetween(yearStart, yearEnd));
    } else {
      setPeriods([]);
    }
  }, [schemeFrequency, dailyMonth, dailyStartDate, dailyEndDate, weeklyStartDate, weeklyEndDate, month, year, yearStart, yearEnd]);

  const handleSubmit = useCallback(async () => {
    if (!selectedScheme || !selectedState) {
      alert("Please select at least Scheme and State.");
      return;
    }

    // if (schemeFrequency && ["Daily", "Weekly", "Monthly", "Yearly"].includes(schemeFrequency) && periods.length === 0) {
    //   alert("Please select valid period(s) for the chosen frequency.");
    //   return;
    // }

    setLoading(true);
    setError("");
    try {
      const payload = {
        scheme_code: selectedScheme,
        state_code: selectedState,
        division_code: selectedDivision,
        district_code: selectedDistrict,
        taluka_code: selectedTaluka,
        year,
        month,
        frequency: schemeFrequency,
        periods,
      };

      // const res = isTimeSeries
      //   ? await getTimeSeriesData(payload)
      //   : await getDashboardData(payload);

      // const data = res?.data ?? res;

      // if (isTimeSeries) {
      //   setTimeSeriesData(Array.isArray(data) ? data : (data.timeSeries || []));
      //   setDashboardData(null);
      // } else {
      //   if (data && (data.merged || data.stats || data.explanations)) {
      //     setDashboardData({ merged: data.merged || {}, stats: data.stats || null, explanations: data.explanations || null });
      //   } else if (data && typeof data === 'object') {
      //     setDashboardData({ merged: data, stats: null, explanations: null });
      //   } else {
      //     setDashboardData({ merged: {}, stats: null, explanations: null });
      //   }
      //   setTimeSeriesData(null);
      // }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError("Failed to fetch dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [
    selectedScheme, selectedState, selectedDivision, selectedDistrict,
    selectedTaluka, year, month, isTimeSeries, schemeFrequency, periods,
  ]);

  const dropdowns = [
    { label: "Scheme", value: selectedScheme, onChange: setSelectedScheme, options: schemes.map((s) => ({ value: s.scheme_code, label: s.scheme_name })) },
    { label: "Year", value: year, onChange: setYear, options: years.map((y) => ({ value: y, label: y })) },
    { label: "Month", value: month, onChange: setMonth, options: months.map((m) => ({ value: m, label: m })) },
    { label: "State", value: selectedState, onChange: setSelectedState, options: states.map((s) => ({ value: s.state_code, label: s.state_name })), disabled: !!localStorage.getItem("state_code") },
    { label: "Division", value: selectedDivision, onChange: setSelectedDivision, options: divisions.map((d) => ({ value: d.division_code, label: d.division_name })), disabled: !divisions.length || !!localStorage.getItem("division_code") },
    { label: "District", value: selectedDistrict, onChange: setSelectedDistrict, options: districts.map((d) => ({ value: d.district_code, label: d.district_name })), disabled: !districts.length || !!localStorage.getItem("district_code") },
    { label: "Taluka", value: selectedTaluka, onChange: setSelectedTaluka, options: talukas.map((t) => ({ value: t.taluka_code, label: t.taluka_name })), disabled: !talukas.length || !!localStorage.getItem("taluka_code") },
  ];

  const PeriodControls = () => {
    if (!schemeFrequency) return null;

    if (schemeFrequency === "Daily") {
      return (
        <Box my={2} display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <FormControl size="small"><InputLabel>Year</InputLabel><Select value={year} label="Year" onChange={(e) => setYear(e.target.value)}><MenuItem value=""><em>None</em></MenuItem>{years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}</Select></FormControl>
          <FormControl size="small"><InputLabel>Month</InputLabel><Select value={dailyMonth} label="Month" onChange={(e) => setDailyMonth(e.target.value)}><MenuItem value=""><em>Choose</em></MenuItem>{months.map((m, idx) => (<MenuItem key={idx} value={String(idx + 1).padStart(2, "0")}>{m}</MenuItem>))}</Select></FormControl>
          <div><label>Start</label><input type="date" value={dailyStartDate} onChange={(e) => setDailyStartDate(e.target.value)} /></div>
          <div><label>End</label><input type="date" value={dailyEndDate} onChange={(e) => setDailyEndDate(e.target.value)} /></div>
          <Typography variant="body2">{periods.length} day(s) selected</Typography>
        </Box>
      );
    }
    if (schemeFrequency === "Weekly") {
      return (
        <Box my={2} display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <div><label>Start</label><input type="date" value={weeklyStartDate} onChange={(e) => setWeeklyStartDate(e.target.value)} /></div>
          <div><label>End</label><input type="date" value={weeklyEndDate} onChange={(e) => setWeeklyEndDate(e.target.value)} /></div>
          <Typography variant="body2">{periods.length} week(s) selected</Typography>
        </Box>
      );
    }
    if (schemeFrequency === "Monthly") {
      return (
        <Box my={2} display="flex" alignItems="center" gap={2}>
          <FormControl size="small"><InputLabel>Year</InputLabel><Select value={year} label="Year" onChange={(e) => setYear(e.target.value)}><MenuItem value=""><em>None</em></MenuItem>{years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}</Select></FormControl>
          <FormControl size="small"><InputLabel>Month</InputLabel><Select value={month} label="Month" onChange={(e) => setMonth(e.target.value)}><MenuItem value=""><em>Choose</em></MenuItem>{months.map((m, idx) => (<MenuItem key={idx} value={String(idx + 1).padStart(2, "0")}>{m}</MenuItem>))}</Select></FormControl>
          <Typography variant="body2">{periods.length ? periods[0] : "No month selected"}</Typography>
        </Box>
      );
    }
    if (schemeFrequency === "Yearly") {
      return (
        <Box my={2} display="flex" alignItems="center" gap={2}>
          <FormControl size="small"><InputLabel>Start Year</InputLabel><Select value={yearStart} label="Start Year" onChange={(e) => setYearStart(e.target.value)}><MenuItem value=""><em>Start</em></MenuItem>{years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}</Select></FormControl>
          <FormControl size="small"><InputLabel>End Year</InputLabel><Select value={yearEnd} label="End Year" onChange={(e) => setYearEnd(e.target.value)}><MenuItem value=""><em>End</em></MenuItem>{years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}</Select></FormControl>
          <Typography variant="body2">{periods.length} year(s) selected</Typography>
        </Box>
      );
    }
    return null;
  };

  const hasDashboardContent = () => dashboardData && dashboardData.merged && Object.keys(dashboardData.merged).length > 0;
  const hasTimeSeriesContent = () => Array.isArray(timeSeriesData) && timeSeriesData.length > 0;

  return (
    <Box p={3}>
      <WelcomeBanner />
      {/* <FilterPanel
        dropdowns={dropdowns}
        isTimeSeries={isTimeSeries}
        setIsTimeSeries={setIsTimeSeries}
        handleSubmit={handleSubmit}
        loading={loading}
      /> */}
      {/* <Box mt={2}>
        <Typography variant="body2"><strong>Scheme Frequency:</strong> {schemeFrequency ?? "—"}</Typography>
        <PeriodControls />
      </Box> */}
      {error && <Typography color="error">{error}</Typography>}
      {loading && (
        <Grid container spacing={2} mt={2}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Grid item xs={12} md={4} key={i}><Skeleton variant="rectangular" height={200} /></Grid>
          ))}
        </Grid>
      )}
      {/* {!loading && !error && (
        <>
          {!isTimeSeries && hasDashboardContent() && (
            <Charts
              data={dashboardData.merged}
              stats={dashboardData.stats}
              explanations={dashboardData.explanations}
            />
          )}
          {isTimeSeries && hasTimeSeriesContent() && (
            <Charts timeSeries data={timeSeriesData} />
          )}
          {!hasDashboardContent() && !hasTimeSeriesContent() && <EmptyState />}
        </>
      )} */}
    </Box>
  );
}
