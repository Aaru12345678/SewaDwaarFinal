// controllers/appointmentController.js
const pool = require("../db");

// ============================
// Cancel Appointment
// ============================
exports.cancelAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const { cancelled_reason } = req.body || "";

    const result = await pool.query(
      "SELECT cancel_appointment($1, $2, $3) AS response",
      [appointmentId, "visitor", cancelled_reason]
    );

    const dbResponse = result.rows[0].response;

    return res.json({
      success: true,
      message: dbResponse
    });

  } catch (err) {
    console.error("Error cancelling appointment:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ============================
// Get Appointments Summary
// ============================
exports.getAppointmentsSummary = async (req, res) => {
  try {
    const { from_date, to_date } = req.query;

    const result = await pool.query(
      "SELECT get_appointments_summary($1, $2) AS data",
      [from_date || null, to_date || null]
    );

    return res.status(200).json({
      success: true,
      data: result.rows[0].data
    });

  } catch (error) {
    console.error("getAppointmentsSummary error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch appointments summary"
    });
  }
};

// ============================
// Get Roles Summary
// ============================
exports.getRolesSummary = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT get_roles_summary() AS data"
    );

    return res.status(200).json({
      success: true,
      data: result.rows[0].data
    });

  } catch (error) {
    console.error("Error fetching roles summary:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch roles summary"
    });
  }
};

// ============================
// Get Appointment Details
// ============================
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
        message: "Appointment not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error("❌ Error fetching appointment details:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching appointment details"
    });
  }
};

// ============================
// Delete Appointment (Admin)
// ============================
exports.deleteAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;

    const result = await pool.query(
      "SELECT delete_appointment($1) AS response",
      [appointmentId]
    );

    return res.status(200).json({
      success: true,
      message: "Appointment deleted successfully"
    });

  } catch (error) {
    console.error("❌ Error deleting appointment:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while deleting appointment"
    });
  }
};
