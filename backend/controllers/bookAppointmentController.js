const pool = require('../db'); // your PostgreSQL pool connection
// const { toast } = require('react-toastify'); // optional if used on frontend

// Controller to insert appointment
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

    // Parse files uploaded
    const uploadedDocuments = req.files?.map((file) => ({
      file_name: file.originalname,
      file_path: file.path,
      uploaded_by: insert_by || "system"
    }));

    // Convert to JSON string for DB (if needed)
    const documentsJson = uploadedDocuments?.length
      ? JSON.stringify(uploadedDocuments)
      : null;

    // Validate required fields
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
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const query = `
      SELECT * FROM insert_appointment(
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::json
      )
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
      insert_by || 'system',
      insert_ip || 'NA',
      documentsJson
    ];

    const { rows } = await pool.query(query, values);

    return res.status(201).json({ success: true, appointment: rows[0] });
  } catch (err) {
    console.error('Error creating appointment:', err);
    return res.status(500).json({ success: false, message: 'Failed to create appointment' });
  }
};
