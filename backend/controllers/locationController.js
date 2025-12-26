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

//a 

exports.getOrganization = async(req,res)=>{
  try{
    const result=await pool.query('SELECT * FROM get_organizations();');
    res.json(result.rows);
  }
  catch(err){
    console.error('Error fetching organizations:',err);
    res.status(500).json({error:'Failed'});
  }
};

exports.getOrganizationbyLocation = async (req, res) => {
  try {
    const {
      state_code,
      division_code,
      district_code = null,
      taluka_code = null
    } = req.query;

    // 🚨 Mandatory validation
    if (!state_code || !division_code) {
      return res.status(400).json({
        success: false,
        message: "state_code and division_code are required"
      });
    }

    const result=await pool.query('SELECT * FROM get_organizations($1,$2,$3,$4)',[state_code,division_code,district_code,taluka_code]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching organizations:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch organizations"
    });
  }
};




exports.getDepartment=async(req,res)=>{
  const {organization_id} = req.params;
  try{
    const result=await pool.query('SELECT * FROM get_departments($1);',[organization_id]);
    res.json(result.rows);
  }
  catch(err){
    console.error('Error fetching department:', err);
    res.status(500).json({ error: 'Failed to fetch department'});
  }
};

exports.getServices=async(req,res)=>{
  const {organization_id,department_id}=req.params;
  try {
    const result= await pool.query('SELECT * FROM get_services($1,$2);',[organization_id,department_id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Failed to fetch services'});
  }
}

exports.getServices2=async(req,res)=>{
  const {organization_id}=req.params;
  try {
    const result= await pool.query('SELECT * FROM get_services2($1);',[organization_id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Failed to fetch services'});
  }
}

exports.getDesignations = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM get_designations();");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching designations:", err);
    res.status(500).json({ error: "Failed to fetch designations" });
  }
};
// 