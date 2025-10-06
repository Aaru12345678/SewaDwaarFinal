import React from 'react';
import { Box, Typography, Select, MenuItem, InputLabel, FormControl } from "@mui/material";

const MemoizedPeriodControls = ({
  frequency,
  filters,
  setFilters,
  periodInputs,
  setPeriodInputs,
  years,
  months,
  periodCount
}) => {
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handlePeriodInputChange = (field, value) => {
    setPeriodInputs(prev => ({ ...prev, [field]: value }));
  };

  const commonYearMonthSelect = (
    <>
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Year</InputLabel>
        <Select value={filters.year} label="Year" onChange={(e) => handleFilterChange('year', e.target.value)}>
          <MenuItem value=""><em>None</em></MenuItem>
          {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Month</InputLabel>
        <Select value={filters.month} label="Month" onChange={(e) => handleFilterChange('month', e.target.value)}>
          <MenuItem value=""><em>None</em></MenuItem>
          {months.map((m) => (<MenuItem key={m} value={m}>{m}</MenuItem>))}
        </Select>
      </FormControl>
    </>
  );

  const renderControls = () => {
    switch (frequency) {
      case "Daily":
        return (
          <>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Year</InputLabel>
              <Select value={filters.year} label="Year" onChange={(e) => handleFilterChange('year', e.target.value)}>
                <MenuItem value=""><em>None</em></MenuItem>
                {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Month</InputLabel>
              <Select value={periodInputs.dailyMonth} label="Month" onChange={(e) => handlePeriodInputChange('dailyMonth', e.target.value)}>
                <MenuItem value=""><em>Choose</em></MenuItem>
                {months.map(m => (<MenuItem key={m} value={m}>{m}</MenuItem>))}
              </Select>
            </FormControl>
            <div><label>Start</label><input type="date" value={periodInputs.dailyStartDate} onChange={(e) => handlePeriodInputChange('dailyStartDate', e.target.value)} /></div>
            <div><label>End</label><input type="date" value={periodInputs.dailyEndDate} onChange={(e) => handlePeriodInputChange('dailyEndDate', e.target.value)} /></div>
          </>
        );
      case "Weekly":
        return (
          <>
            <div><label>Start</label><input type="date" value={periodInputs.weeklyStartDate} onChange={(e) => handlePeriodInputChange('weeklyStartDate', e.target.value)} /></div>
            <div><label>End</label><input type="date" value={periodInputs.weeklyEndDate} onChange={(e) => handlePeriodInputChange('weeklyEndDate', e.target.value)} /></div>
          </>
        );
      case "Monthly":
        return commonYearMonthSelect;
      case "Yearly":
        return (
          <>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Start Year</InputLabel>
              <Select value={periodInputs.yearStart} label="Start Year" onChange={(e) => handlePeriodInputChange('yearStart', e.target.value)}>
                <MenuItem value=""><em>Start</em></MenuItem>
                {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>End Year</InputLabel>
              <Select value={periodInputs.yearEnd} label="End Year" onChange={(e) => handlePeriodInputChange('yearEnd', e.target.value)}>
                <MenuItem value=""><em>End</em></MenuItem>
                {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
              </Select>
            </FormControl>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Box my={2} display="flex" alignItems="center" gap={2} flexWrap="wrap">
      {renderControls()}
      <Typography variant="body2" sx={{ ml: 1 }}>
        ({periodCount} {frequency === 'Daily' ? 'day(s)' : frequency === 'Weekly' ? 'week(s)' : 'period(s)'} selected)
      </Typography>
    </Box>
  );
};

// React.memo prevents re-rendering if props haven't changed
const PeriodControls = React.memo(MemoizedPeriodControls);
export default PeriodControls;