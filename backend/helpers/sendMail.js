const nodemailer = require("nodemailer");

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  secure: true, // true for 465, false for other ports
  auth: {
    user: "khandagalearadhana@gmail.com",
    pass: "jncwumjhasswjxmg",
  },
});

// Wrap in an async IIFE so we can use await.
async function sendMail (to,subject,html) {
  const info = await transporter.sendMail({
    from: 'khandagalearadhana@gmail.com',
    to,
    subject,
    html // HTML body
  });

};

module.exports={sendMail}
