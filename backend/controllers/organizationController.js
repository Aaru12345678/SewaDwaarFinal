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

exports.UpdateaddBulkDepartments = async (req, res) => {
  const client = await pool.connect();

  try {
    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: "Request body is missing",
      });
    }

    const { organization_id, departments } = req.body;

    if (!organization_id || !Array.isArray(departments)) {
      return res.status(400).json({
        success: false,
        message: "organization_id and departments array are required",
      });
    }

    const result = await client.query(
      `SELECT update_department_data($1, $2::json) AS response`,
      [organization_id, JSON.stringify(departments)]
    );

    return res.json(result.rows[0].response);

  } catch (err) {
    console.error("Error updating departments:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while updating departments",
    });
  } finally {
    client.release();
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




exports.updateMultipleServices = async (req, res) => {
  try {
    const services = req.body; // frontend sends JSON array

    // 🔹 Basic validation
    if (!Array.isArray(services) || services.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No services provided",
      });
    }

    // 🔹 Call PostgreSQL UPDATE function
    const result = await pool.query(
      "SELECT update_multiple_services($1::jsonb) AS response",
      [JSON.stringify(services)]
    );

    const dbResponse = result.rows?.[0]?.response;
    console.log(dbResponse,"dbResponse")
    if (!dbResponse) {
      return res.status(500).json({
        success: false,
        message: "No response from database",
      });
    }

    // 🔴 DB returned logical failure
    if (dbResponse.status !== "success") {
      return res.status(400).json({
        success: false,
        message: dbResponse.message || "Service update failed",
      });
    }

    // ✅ SUCCESS
    return res.status(200).json({
      success: true,
      services_updated: dbResponse.services_updated,
      message: "Services updated successfully",
    });

  } catch (err) {
    console.error("Update services error:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
};

// get officer by id
exports.getUserByEntityId = async (req, res) => {
  try {
    const { entity_id } = req.params;

    const result = await pool.query(
      `SELECT get_user_entity_by_id($1) AS data`,
      [entity_id]
    );

    const response = result.rows[0].data;
    console.log(response,"response")
    if (!response || response.success === false) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      role_code: response.role_code,
      data: response.data,
    });

  } catch (err) {
    console.error("❌ getUserByEntityId error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};





// update officer:
exports.updateOfficerByRole = async (req, res) => {
  try {
    console.log("📩 Raw req.body:", req.body);
    console.log("📸 req.file:", req.file);

    const body = req.body || {};

    const {
      entity_id, // officer_id / helpdesk_id / admin_id
      full_name,
      mobile_no,
      email_id,
      gender,
      designation_code,
      department_id,
      organization_id,
      officer_address,
      officer_state_code,
      officer_district_code,
      officer_division_code,
      officer_taluka_code,
      officer_pincode,
      role_code // OF / HD / AD
    } = body;

    /* -------------------- BASIC VALIDATION -------------------- */
    if (!entity_id || !role_code || !full_name) {
      return res.status(400).json({
        success: false,
        message: "entity_id, full_name and role_code are required",
      });
    }

    /* -------------------- ROLE VALIDATION -------------------- */
    const roleCheck = await pool.query(
      `SELECT 1
       FROM m_role
       WHERE role_code = $1 AND is_active = TRUE`,
      [role_code]
    );

    if (roleCheck.rowCount === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid or inactive role code",
      });
    }

    /* -------------------- PHOTO -------------------- */
    const photo = req.file ? req.file.filename : null;

    console.log("📦 Parameters passed to DB function:", {
      entity_id,
      full_name,
      mobile_no,
      email_id,
      gender,
      designation_code,
      department_id,
      organization_id,
      officer_address,
      officer_state_code,
      officer_district_code,
      officer_division_code,
      officer_taluka_code,
      officer_pincode,
      photo,
      role_code,
    });

    /* -------------------- DB FUNCTION CALL -------------------- */
    const result = await pool.query(
      `SELECT * FROM public.update_user_by_role(
        $1,$2,$3,$4,$5,$6,$7,$8,
        $9,$10,$11,$12,$13,$14,
        $15,$16
      );`,
      [
        entity_id,                       // $1 p_entity_id
        full_name.trim(),                // $2 p_full_name
        mobile_no?.trim() || null,       // $3 p_mobile_no
        email_id?.trim() || null,        // $4 p_email_id
        gender || null,                  // $5 p_gender
        designation_code || null,        // $6 p_designation_code
        department_id || null,           // $7 p_department_id
        organization_id || null,         // $8 p_organization_id

        officer_address || null,         // $9 p_officer_address
        officer_state_code || null,      // $10 p_officer_state_code
        officer_district_code || null,   // $11 p_officer_district_code
        officer_division_code || null,   // $12 p_officer_division_code
        officer_taluka_code || null,     // $13 p_officer_taluka_code
        officer_pincode || null,         // $14 p_officer_pincode

        photo,                           // $15 p_photo
        role_code,                       // $16 p_role_code
      ]
    );

    const row = result.rows[0];
    console.log("🧾 DB function result:", row);

    /* -------------------- FINAL RESPONSE -------------------- */
    if (row?.message?.toLowerCase().includes("success")) {
      return res.status(200).json({
        success: true,
        message: row.message,
        entity_id: row.out_entity_id,
        email: row.out_email_id,
      });
    }

    return res.status(400).json({
      success: false,
      message: row?.message || "User update failed",
    });

  } catch (error) {
    console.error("💥 updateOfficerByRole error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
