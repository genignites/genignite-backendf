require("dotenv").config();
const express = require("express");
const multer = require("multer");
const { Resend } = require("resend");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static("public"));

// ✅ Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// ✅ Resume upload folder
const upload = multer({ dest: "uploads/" });

/* =====================================================
   ✅ TEST EMAIL ENDPOINT
   Use to check if Resend is working
====================================================== */
app.get("/test-email", async (req, res) => {
  try {
    const resp = await resend.emails.send({
      from: "GenIgnite Technologies <onboarding@resend.dev>",
      to: process.env.RECIPIENT,
      subject: "GenIgnite Backend Test Email ✅",
      html: "<h2>Your backend email service is working!</h2>",
    });

    res.json({ success: true, message: "Test email sent!", id: resp.id });
  } catch (err) {
    console.error("Test Email Error:", err);
    res.json({ success: false, error: "Failed to send test email" });
  }
});

/* =====================================================
   ✅ INTERNSHIP APPLICATION ENDPOINT
====================================================== */
app.post("/apply", upload.single("resume"), async (req, res) => {
  try {
    const { name, email, phone, domain, message } = req.body;

    if (!req.file) {
      return res.json({ success: false, error: "Resume file missing" });
    }

    const filePath = req.file.path;
    const fileContent = fs.readFileSync(filePath);

    // ✅ Send email using Resend
    const emailResponse = await resend.emails.send({
      from: "GenIgnite Technologies <onboarding@resend.dev>",
      to: process.env.RECIPIENT,
      subject: `New Internship Application - ${name}`,
      html: `
        <h2>New Internship Application</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Domain:</strong> ${domain}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
      attachments: [
        {
          filename: req.file.originalname,
          content: fileContent.toString("base64"),
        },
      ],
    });

    // ✅ Delete file after sending
    fs.unlinkSync(filePath);

    res.json({ success: true, message: "Application sent successfully!" });

  } catch (err) {
    console.error("Email Error:", err);
    res.json({ success: false, error: "Failed to send email" });
  }
});

/* =====================================================
   ✅ START SERVER
====================================================== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`GenIgnite Backend running at port ${PORT}`)
);
