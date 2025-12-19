// controllers/appointmentController.js
const pool = require("../db");

// controllers/appointmentController.js
exports.cancelAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;

    const result = await pool.query(
      "SELECT cancel_appointment($1, $2) AS response",
      [appointmentId, "visitor"]
    );

    const dbResponse = result.rows[0].response;

    console.log("DB response:", dbResponse); // for debugging

    // Treat any truthy value as success
    return res.json({
      success: !!dbResponse,
      message: dbResponse,
    });

  } catch (err) {
    console.error("Error cancelling appointment:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

exports.getAppointmentsSummary = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT get_appointments_summary() AS data;"
    );

    // Function returns JSON
    const summary = result.rows[0]?.data;

    return res.status(200).json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error("getAppointmentsSummary error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch appointments summary",
      error: error.message
    });
  }
};

exports.getRolesSummary = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT get_roles_summary() AS data"
    );

    res.status(200).json({
      success: true,
      data: result.rows[0].data
    });
  } catch (error) {
    console.error("Error fetching roles summary:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch roles summary"
    });
  }
};

exports.getAppointmentDetails = async (req, res) => {
  const { appointmentId } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM get_appointment_details1($1)",
      [appointmentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error fetching appointment details:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching appointment details",
    });
  }
};
