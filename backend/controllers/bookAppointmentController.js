const pool = require('../db');
 // your PostgreSQL pool connection
// const { toast } = require('react-toastify'); // optional if used on frontend

// Controller to insert appointment
// 

// controllers/bookAppointmentController.js
exports.createAppointment = async (req, res) => {
  try {
    const {
      /* Mandatory */
      visitor_id,
      organization_id,
      officer_id,
      service_id,
      purpose,
      appointment_date,
      slot_time,
      state_code,

      /* Optional */
      department_id,
      division_code,
      district_code,
      taluka_code,
      insert_by,
      insert_ip
    } = req.body;

    /* 🔐 Mandatory validations */
    if (
      !visitor_id ||
      !organization_id ||
      !officer_id ||
      !service_id ||
      !purpose ||
      !appointment_date ||
      !slot_time ||
      !state_code
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    /* ✅ Function call (ORDER MATTERS) */
    const query = `
      SELECT insert_appointment(
        $1,  -- visitor_id
        $2,  -- organization_id
        $3,  -- officer_id
        $4,  -- service_id
        $5,  -- purpose
        $6,  -- appointment_date
        $7,  -- slot_time
        $8,  -- state_code
        $9,  -- department_id (optional)
        $10, -- division_code
        $11, -- district_code
        $12, -- taluka_code
        $13, -- insert_by
        $14  -- insert_ip
      ) AS appointment_id;
    `;

    const values = [
      visitor_id,
      organization_id,
      officer_id,
      service_id,
      purpose,
      appointment_date,
      slot_time,
      state_code,
      department_id || null,
      division_code || null,
      district_code || null,
      taluka_code || null,
      insert_by || "system",
      insert_ip || req.ip
    ];

    console.log("📤 SQL Params:", values);

    const { rows } = await pool.query(query, values);

    if (!rows || rows.length === 0) {
      return res.status(500).json({
        success: false,
        message: "No appointment ID returned"
      });
    }

    return res.status(201).json({
      success: true,
      appointment_id: rows[0].appointment_id,
      message: "Appointment booked successfully"
    });

  } catch (err) {
    console.error("❌ Error creating appointment:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to create appointment"
    });
  }
};

exports.uploadAppointmentDocument = async (req, res) => {
  try {
    const { appointment_id } = req.params; // <-- fixed here
    const { uploaded_by, doc_type } = req.body;

    if (!appointment_id) {
      return res.status(400).json({ success: false, message: "Appointment ID is required" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No files uploaded" });
    }

    const uploadedDocuments = [];

    for (const file of req.files) {
      const query = `
        SELECT * FROM insert_appointment_document($1, $2, $3, $4)
      `;
      const values = [
        appointment_id,
        doc_type || file.originalname,
        file.path,
        uploaded_by || "system",
      ];

      const { rows } = await pool.query(query, values);
      uploadedDocuments.push(rows[0]);
    }

    return res.status(201).json({ success: true, documents: uploadedDocuments });
  } catch (err) {
    console.error("Error uploading documents:", err);
    return res.status(500).json({ success: false, message: "Failed to upload documents" });
  }
};

exports.createWalkinAppointment = async (req, res) => {
  try {
    const {
      visitor_id,
      organization_id,
      department_id,   // optional
      service_id,
      purpose,
      walkin_date,
      slot_time,
      full_name,
      gender,
      mobile_no,
      email_id,
      state_code,
      division_code,
      officer_id,      // mandatory (officer OR helpdesk)
      status,          // optional
      remarks,
      district_code,
      taluka_code
    } = req.body;

    /* 🔐 System fields */
    const insert_by = req.user?.user_id || "system";
    const insert_ip = req.ip || "127.0.0.1";
    const insert_date = new Date();

    /* ✅ SQL matches FUNCTION PARAM ORDER */
    const query = `
      SELECT create_walkin_appointment(
        $1,  $2,  $3,  $4,  $5,
        $6,  $7,  $8,  $9,  $10,
        $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20,
        $21
      ) AS walkin_id
    `;

    const values = [
      visitor_id,                 // 1
      organization_id,            // 2
      service_id,                 // 3
      purpose,                    // 4
      walkin_date,                // 5
      slot_time,                  // 6
      insert_by,                  // 7
      insert_ip,                  // 8
      full_name,                  // 9
      gender,                     // 10
      mobile_no,                  // 11
      email_id || null,           // 12
      state_code,                 // 13
      division_code,              // 14
      officer_id,                 // 15
      department_id || null,      // 16 ✅ DEFAULT NULL
      status || 'pending',        // 17
      remarks || null,            // 18
      district_code || null,      // 19
      taluka_code || null,        // 20
      insert_date                 // 21
    ];

    console.log("📤 SQL PARAMS:", values);

    const { rows } = await pool.query(query, values);

    return res.status(201).json({
      success: true,
      walkin_id: rows[0].walkin_id,
      message: "Walk-in appointment created successfully"
    });

  } catch (error) {
    console.error("❌ Create walk-in error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
