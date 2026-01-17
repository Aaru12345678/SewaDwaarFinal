const pool = require("../db");

// exports.addBulkDepartments = async (req, res) => {
//   const client = await pool.connect();

//   try {
//     const { organization_id, state_code, departments } = req.body;

//     // Validate input
//     if (!organization_id || !state_code || !departments) {
//       return res.status(400).json({
//         success: false,
//         message: "organization_id, state_code, and departments are required",
//       });
//     }

//     // Call PostgreSQL function with 3 params
//     const result = await client.query(
//       `SELECT insert_department_data($1, $2, $3::json) AS response`,
//       [
//         organization_id,
//         state_code,
//         JSON.stringify(departments)  // must be JSON
//       ]
//     );

//     return res.json(result.rows[0].response);

//   } catch (err) {
//     console.error("Error:", err);
//     return res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   } finally {
//     client.release();
//   }
// };

// const pool = require("../db");

exports.addBulkDepartments = async (req, res) => {
  const client = await pool.connect();

  try {
    const { organization_id, departments } = req.body;

    // 🛑 Validate input
    if (!organization_id || !departments || !Array.isArray(departments)) {
      return res.status(400).json({
        success: false,
        message: "organization_id and departments array are required",
      });
    }

    // 🟢 Call PostgreSQL function (UPDATED signature)
    const result = await client.query(
      `SELECT insert_department_data($1, $2::json) AS response`,
      [
        organization_id,
        JSON.stringify(departments)
      ]
    );

    return res.json(result.rows[0].response);

  } catch (err) {
    console.error("Error inserting departments:", err);

    return res.status(500).json({
      success: false,
      message: "Server error while inserting departments",
    });

  } finally {
    client.release();
  }
};


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

// const pool = require('../config/db');

// controllers/departmentController.js
// exports.getDepartmentById = async (req, res) => {
//   try {
//     const { department_id } = req.params;

//     const { rows } = await pool.query(
//       "SELECT * FROM get_department_by_id($1)",
//       [department_id]
//     );

//     if (rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Department not found",
//       });
//     }

//     res.json({
//       success: true,
//       data: rows,
//     });
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };

// exports.getDepartmentById = async (req, res) => {
//   try {
//     const { department_id } = req.params;

//     const { rows } = await pool.query(
//       "SELECT * FROM get_department_by_id($1)",
//       [department_id]
//     );

//     if (rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Department not found",
//       });
//     }

//     // 🟢 Build department object
//     const department = {
//       department_id: rows[0].department_id,
//       organization_id: rows[0].organization_id,
//       department_name: rows[0].department_name,
//       department_name_ll: rows[0].department_name_ll,
//       state_code: rows[0].state_code,
//       services: rows
//         .filter(r => r.service_id !== null)
//         .map(r => ({
//           service_id: r.service_id,
//           service_name: r.service_name,
//           service_name_ll: r.service_name_ll,
//         })),
//     };

//     res.json({
//       success: true,
//       data: department,
//     });
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };

exports.getDepartmentById = async (req, res) => {
  const { department_id } = req.params;
  console.log("🔥 CONTROLLER HIT 🔥", req.originalUrl, req.params);
  console.log("HIT CONTROLLER, department_id =", department_id);
  try {
    const { rows } = await pool.query(
      "SELECT get_department_by_id_json($1) AS data",
      [department_id]
    );

    console.log("DB rows:", rows);

    // 🔑 CRITICAL FIX
    if (!rows.length || !rows[0].data) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
        data: null
      });
    }

    return res.status(200).json({
      success: true,
      data: rows[0].data
    });

  } catch (error) {
    console.error("❌ Get department error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


