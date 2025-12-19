const pool = require("../db");

exports.addBulkDepartments = async (req, res) => {
  const client = await pool.connect();

  try {
    const { organization_id, state_code, departments } = req.body;

    // Validate input
    if (!organization_id || !state_code || !departments) {
      return res.status(400).json({
        success: false,
        message: "organization_id, state_code, and departments are required",
      });
    }

    // Call PostgreSQL function with 3 params
    const result = await client.query(
      `SELECT insert_department_data($1, $2, $3::json) AS response`,
      [
        organization_id,
        state_code,
        JSON.stringify(departments)  // must be JSON
      ]
    );

    return res.json(result.rows[0].response);

  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  } finally {
    client.release();
  }
};

// const pool = require("../db");

// Get active departments count
exports.getActiveDepartmentsCount = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT get_active_departments_count()"
    );

    res.json(result.rows)
    console.log(result,"result")

  } catch (error) {
    console.error("Error fetching active departments count:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};
