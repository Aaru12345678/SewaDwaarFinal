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

