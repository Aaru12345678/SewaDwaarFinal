const pool = require("../db");

// ------------------ ORGANIZATIONS ------------------
exports.getAllOrganizations = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM get_all_organizations()"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------ DEPARTMENTS BY ORG ------------------
exports.getDepartmentsByOrg = async (req, res) => {
  try {
    const { organization_id } = req.params;

    const result = await pool.query(
      "SELECT * FROM get_departments_by_org($1)",
      [organization_id]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------ SERVICES BY DEPARTMENT ------------------
exports.getServicesByDepartment = async (req, res) => {
  try {
    const { organization_id, department_id } = req.params;

    const result = await pool.query(
      "SELECT * FROM get_services_by_department($1,$2)",
      [organization_id, department_id]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------ ALL OFFICERS ------------------
exports.getAllOfficers = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM get_all_officers()"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching officers:", err);
    res.status(500).json({ error: err.message });
  }
};