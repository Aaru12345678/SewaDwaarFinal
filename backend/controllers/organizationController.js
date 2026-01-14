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

exports.getOrganizationById = async (req, res) => {
  try {
    const { id } = req.params;

    // 🛑 Validate param
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Organization ID is required",
      });
    }

    // 📦 Call PostgreSQL function
    const query = `
      SELECT get_organization_by_id($1) AS result
    `;

    const { rows } = await pool.query(query, [id]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    const result = rows[0].result;

    // 🛑 Function-level failure
    if (!result || result.success === false) {
      return res.status(404).json({
        success: false,
        message: result?.message || "Organization not found",
      });
    }

    // ✅ Success
    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error("❌ Error fetching organization:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch organization details",
      error: error.message,
    });
  }
};

exports.updateOrganization = async (req, res) => {
  try {
    const { organization_id } = req.params;

    const {
      organization_name,
      organization_name_ll,
      state_code,
      address_line,
      pincode,
      division_code,
      district_code,
      taluka_code
    } = req.body;

    // 🔴 Validation
    if (!organization_id) {
      return res.status(400).json({
        success: false,
        message: "Organization ID is required"
      });
    }

    if (!organization_name || !state_code || !address_line || !pincode) {
      return res.status(400).json({
        success: false,
        message: "Missing required organization fields"
      });
    }

    const query = `
      SELECT update_organization_only(
        $1,$2,$3,$4,$5,$6,$7,$8,$9
      ) AS result
    `;

    const values = [
      organization_id,
      organization_name,
      organization_name_ll || null,
      state_code,
      address_line,
      pincode,
      division_code || null,
      district_code || null,
      taluka_code || null
    ];

    const { rows } = await pool.query(query, values);

    if (!rows?.length || !rows[0].result) {
      return res.status(500).json({
        success: false,
        message: "No response from update function"
      });
    }

    if (!rows[0].result.success) {
      return res.status(404).json(rows[0].result);
    }

    return res.status(200).json({
      success: true,
      message: "Organization updated successfully",
      data: rows[0].result
    });

  } catch (error) {
    console.error("❌ Error updating organization:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update organization"
    });
  }
};

