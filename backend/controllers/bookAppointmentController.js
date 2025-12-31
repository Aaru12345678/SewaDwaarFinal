const pool = require('../db');
 // your PostgreSQL pool connection
// const { toast } = require('react-toastify'); // optional if used on frontend

// Controller to insert appointment
// 

// controllers/bookAppointmentController.js
exports.createAppointment = async (req, res) => {
  try {
    const {
      visitor_id,
      organization_id,
      department_id,
      officer_id,
      service_id,
      purpose,
      appointment_date,
      slot_time,
      insert_by,
      insert_ip
    } = req.body;

    if (
      !visitor_id ||
      !organization_id ||
      !department_id ||
      !officer_id ||
      !service_id ||
      !purpose ||
      !appointment_date ||
      !slot_time
    ) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const query = `
      SELECT insert_appointment(
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
      ) AS appointment_id
    `;

    const values = [
      visitor_id,
      organization_id,
      department_id,
      officer_id,
      service_id,
      purpose,
      appointment_date,
      slot_time,
      insert_by || "system",
      insert_ip || "127.0.0.1"
    ];
    console.log("📤 SQL Params:", values);
    const { rows } = await pool.query(query, values);

    if (!rows || rows.length === 0) {
      return res.status(500).json({ success: false, message: "No appointment ID returned" });
    }

    const appointment_id = rows[0].appointment_id;

    console.log("✅ Appointment created with ID:", appointment_id);

    // 🔹 Return clear structure:
    return res.status(201).json({
      success: true,
      appointment_id,
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
