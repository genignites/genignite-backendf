require("dotenv").config();
const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Resume uploads directory
const upload = multer({ dest: "uploads/" });

// Email route
app.post("/apply", upload.single("resume"), async (req, res) => {
  try {
    const { name, email, phone, domain, message } = req.body;
    const resumeFile = req.file;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.RECIPIENT || process.env.EMAIL_USER,
      subject: "New Internship Application – GenIgnite",
      text: `
New Internship Application

Name: ${name}
Email: ${email}
Phone: ${phone}
Domain: ${domain}
Message: ${message}
      `,
      attachments: [
        {
          filename: resumeFile.originalname,
          path: resumeFile.path,
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "Application submitted" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, error: "Failed to send email" });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`GenIgnite Backend running at port ${PORT}`));
