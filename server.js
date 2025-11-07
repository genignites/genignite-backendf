require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public')));

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads');
    if(!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive:true});
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g,'_');
    cb(null, Date.now() + '-' + Math.round(Math.random()*1e9) + '-' + safe);
  }
});
const upload = multer({ storage });

// Nodemailer (Gmail App Password recommended)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

app.post('/apply', upload.single('resume'), async (req, res) => {
  try {
    const { name='', email='', phone='', domain='', message='' } = req.body;
    const file = req.file;

    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px">
        <h2>New Internship Application</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Domain:</b> ${domain}</p>
        <p><b>Message:</b><br/>${(message||'').replace(/</g,'&lt;')}</p>
      </div>
    `;

    const mail = await transporter.sendMail({
      from: `"GenIgnite Applications" <${process.env.EMAIL_USER}>`,
      to: process.env.RECIPIENT || process.env.EMAIL_USER,
      subject: `New Internship Application — ${name} (${domain})`,
      html,
      attachments: file ? [{
        filename: file.originalname,
        path: file.path
      }] : []
    });

    // Optional: Log CSV
    const line = [new Date().toISOString(), name, email, phone, domain, message, file?file.filename:'']
      .map(v => '"' + String(v).replace(/"/g,'""') + '"').join(',') + '\n';
    const dir = path.join(__dirname, 'submissions');
    if(!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive:true});
    const csv = path.join(dir, 'applications.csv');
    if(!fs.existsSync(csv)) fs.writeFileSync(csv, 'timestamp,name,email,phone,domain,message,resume\n');
    fs.appendFileSync(csv, line);

    res.json({ success:true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false, error: 'Failed to send email' });
  }
});

app.get('*', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, ()=> console.log(`GenIgnite Email Backend running at http://localhost:${PORT}`));
