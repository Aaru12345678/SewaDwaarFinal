const cron = require("node-cron");
const pool = require("./db");

/**
 * Runs every 1 hour (minute 0)
 */
cron.schedule("0 * * * *", async () => {
  try {
    console.log("⏰ Running auto-reject job...");

    await pool.query("SELECT auto_reject_expired_appointments()");

    console.log("✅ Auto-reject completed");
  } catch (err) {
    console.error("❌ Auto-reject failed:", err.message);
  }
});