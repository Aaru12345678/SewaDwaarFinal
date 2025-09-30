const pool = require('../db');

exports.getStates = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM get_states();');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching states:', err);
    res.status(500).json({ error: 'Failed to fetch states' });
  }
};


exports.getDivisions = async (req, res) => {
  const { state_code } = req.params;
  try {
    const result = await pool.query('SELECT * FROM get_divisions($1);', [state_code]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching divisions:', err);
    res.status(500).json({ error: 'Failed to fetch divisions' });
  }
};

exports.getDistricts = async (req, res) => {
  const { state_code, division_code } = req.query;
  try {
    const result = await pool.query('SELECT * FROM get_districts($1, $2);', [state_code, division_code]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching districts:', err);
    res.status(500).json({ error: 'Failed to fetch districts' });
  }
};

exports.getTalukas = async (req, res) => {
  const { state_code, division_code, district_code } = req.query;
  try {
    const result = await pool.query('SELECT * FROM get_talukas($1, $2, $3);', [
      state_code,
      division_code,
      district_code,
    ]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching talukas:', err);
    res.status(500).json({ error: 'Failed to fetch talukas' });
  }
};

