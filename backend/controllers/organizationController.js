const pool = require("../db");

exports.addOrganization = async (req, res) => {
  try {
    const {
      organization_name,
      organization_name_ll,
      state_code,
      address_line,      // from frontend
      pincode,
      division_code,
      district_code,
      taluka_code,
      departments
    } = req.body;

    // ===============================
    // BASIC SERVER-SIDE VALIDATION
    // ===============================
    if (!organization_name || !state_code || !address_line || !pincode) {
      return res.status(400).json({
        success: false,
        message: "Missing mandatory fields"
      });
    }

    // ===============================
    // CALL SQL FUNCTION
    // ===============================
    const result = await pool.query(
      `
      SELECT insert_organization_data(
        $1,$2,$3,$4,$5,$6,$7,$8,$9
      ) AS response
      `,
      [
        organization_name,
        organization_name_ll || null,
        state_code,
        address_line,
        pincode,
        division_code || null,
        district_code || null,
        taluka_code || null,
        departments ? JSON.stringify(departments) : null
      ]
    );

    const response = result.rows[0]?.response;

    // ===============================
    // SAFETY CHECK
    // ===============================
    if (!response || response.success !== true) {
      return res.status(500).json({
        success: false,
        message: "Organization insertion failed",
        response
      });
    }

    return res.status(201).json(response);

  } catch (err) {
    console.error("Error inserting organization:", err);

    return res.status(500).json({
      success: false,
      message: "Server error while inserting organization",
      details: err.message
    });
  }
};
