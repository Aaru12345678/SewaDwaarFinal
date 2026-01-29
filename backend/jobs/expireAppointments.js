const cron = require("node-cron");
const pool = require("../db");

cron.schedule("*/1 * * * *", async () => {
  try {
    /* =========================
       EXPIRE APPOINTMENTS
    ========================== */
    const apptResult = await pool.query(`
      UPDATE appointments
      SET status = 'expired'
      WHERE status IN ('pending', 'approved')
        AND (appointment_date + slot_time) < NOW()
    `);

    /* =========================
       EXPIRE WALK-INS
    ========================== */
    const walkinResult = await pool.query(`
      UPDATE walkins
      SET status = 'expired'
      WHERE status IN ('pending', 'approved')
        AND (walkin_date + slot_time) < NOW()
    `);

    const totalExpired =
      (apptResult.rowCount || 0) +
      (walkinResult.rowCount || 0);

    if (totalExpired > 0) {
      console.log(
        `[CRON] Auto-expired ${totalExpired} records (Appointments: ${apptResult.rowCount}, Walk-ins: ${walkinResult.rowCount})`
      );
    }
  } catch (err) {
    console.error("[CRON ERROR] Expiry job failed:", err);
  }
});
