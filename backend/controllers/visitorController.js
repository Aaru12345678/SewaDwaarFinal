const pool = require('../db'); // Your PostgreSQL pool

// Get dashboard data for a visitor
exports.getVisitorDashboard = async (req, res) => {
  try {
    const username = req.params.username; // From route: /api/visitor/:username/dashboard

    if (!username) {
      return res.status(400).json({ success: false, message: "username is required" });
    }

    const result = await pool.query(
      `SELECT get_visitor_dashboard_by_username($1) AS data;`,
      [username]
    );

    const dashboardData = result.rows[0].data;

    res.status(200).json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error("Error fetching visitor dashboard:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};
