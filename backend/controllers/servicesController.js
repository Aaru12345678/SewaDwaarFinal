const pool = require("../db");

exports.insertMultipleServices = async (req, res) => {
  try {
    const services = req.body; // frontend sends JSON array

    if (!Array.isArray(services) || services.length === 0) {
      return res.status(400).json({ error: "No services provided" });
    }

    const result = await pool.query(
      "SELECT insert_multiple_services($1::jsonb) AS response",
      [JSON.stringify(services)]
    );

    return res.json(result.rows[0].response);

  } catch (err) {
    console.error("Insert services error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};