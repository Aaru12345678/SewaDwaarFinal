const pool = require("../db");

// exports.insertMultipleServices = async (req, res) => {
//   try {
//     const services = req.body; // frontend sends JSON array

//     if (!Array.isArray(services) || services.length === 0) {
//       return res.status(400).json({ error: "No services provided" });
//     }

//     const result = await pool.query(
//       "SELECT insert_multiple_services($1::jsonb) AS response",
//       [JSON.stringify(services)]
//     );

//     return res.json(result.rows[0].response);

//   } catch (err) {
//     console.error("Insert services error:", err);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// };

exports.insertMultipleServices = async (req, res) => {
  try {
    const services = req.body; // frontend sends JSON array

    // 🔹 Basic validation
    if (!Array.isArray(services) || services.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No services provided"
      });
    }

    // 🔹 Call PostgreSQL function
    const result = await pool.query(
      "SELECT insert_multiple_services($1::jsonb) AS response",
      [JSON.stringify(services)]
    );

    const dbResponse = result.rows[0]?.response;

    // 🔹 Safety check
    if (!dbResponse) {
      return res.status(500).json({
        success: false,
        message: "No response from database"
      });
    }

    // 🔹 DB returned error (handled inside function)
    if (dbResponse.status !== "success") {
      return res.status(400).json({
        success: false,
        message: dbResponse.message || "Service insertion failed"
      });
    }

    // ✅ SUCCESS
    return res.status(200).json({
      success: true,
      message: dbResponse.message || "Services inserted successfully"
    });

  } catch (err) {
    console.error("Insert services error:", err);

    // 🔴 PostgreSQL RAISE EXCEPTION message
    return res.status(500).json({
      success: false,
      message: err.message || "Internal Server Error"
    });
  }
};

exports.getServiceById = async (req, res) => {
  const { service_id } = req.params;

  try {
    const { rows } = await pool.query(
      "SELECT get_service_by_id($1) AS result",
      [service_id]
    );

    console.log("DB response:", rows); // raw DB row(s)

    // 🔴 No service found
    if (!rows.length || !rows[0].result) {
      console.log("Service not found for ID:", service_id); // log missing
      return res.status(404).json({
        success: false,
        message: "Service not found"
      });
    }

    // 🟢 Extract actual service data
    const serviceData = rows[0].result;

// If it’s a string, parse it
const parsedData =
  typeof serviceData === "string" ? JSON.parse(serviceData) : serviceData;

return res.status(200).json({
  success: true,
  data: parsedData
});

  } catch (error) {
    console.error("❌ Get service error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};
