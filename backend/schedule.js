const cron = require("node-cron");
const pool = require("./db");

const autoReject = async () => {
  try {
    console.log("⏰ Auto-reject job started");

    // Call DB function
    await pool.query(`SELECT auto_reject_expired_appointments();`);

    console.log("✅ Auto-reject job finished");
  } catch (err) {
    console.error("❌ Auto-reject job failed:", err.message);
  }
};

/* 🔥 Run once when Node starts */
autoReject();

/* 🔁 Run every 2 hours */
cron.schedule("0 */2 * * *", autoReject);
