const pool = require("../db");

exports.addOrganization = async (req, res) => {
  try {
    const {
      organization_name,
      organization_name_ll,
      state_code,
      departments
    } = req.body;

    // Call the SQL function
    const result = await pool.query(
      `SELECT insert_organization_data($1,$2,$3,$4) AS response`,
      [
        organization_name,
        organization_name_ll,
        state_code,
        JSON.stringify(departments)  // <-- critical
      ]
    );

    return res.json(result.rows[0].response);

  } catch (err) {
    console.error("Error inserting organization:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while inserting organization",
      details: err.message
    });
  }
};