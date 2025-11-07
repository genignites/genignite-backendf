require("dotenv").config();
const express = require("express");
const multer = require("multer");
const { Resend } = require("resend");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const resend = new Resend(process.env.RESEND_API_KEY);

// Resume upload folder
const upload = multer({ dest: "uploads/" });

// API route
app.post("/apply", upload.single("resume"), async (req, res) => {
  try {
    const { name, email, phone, domain, message } = req.body;

    const filePath = req.file.path;
    const fileContent = fs.readFileSync(filePath);

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

    // Delete uploaded file after sending email
    fs.unlinkSync(filePath);

    res.json({ success: true, message: "Application sent successfully!" });

  } catch (err) {
    console.error("Email Error:", err);
    res.json({ success: false, error: "Failed to send email" });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`GenIgnite Backend running at port ${PORT}`));
