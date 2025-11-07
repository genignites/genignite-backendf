# GenIgnite — Email Backend (Option A)

This build wires your Internship form to email every submission to **genignites@gmail.com** with the resume attached.

## 1) Create a Gmail App Password (Recommended)
1. Enable 2‑Step Verification on your Google account.
2. Go to https://myaccount.google.com/apppasswords
3. Create a new App Password (select "Mail" and "Other").
4. Copy the 16‑character password.

## 2) Configure environment
- Duplicate `.env.example` to `.env` and set:
  EMAIL_USER=genignites@gmail.com
  EMAIL_PASS=YOUR_GOOGLE_APP_PASSWORD
  (Optional) RECIPIENT=another@email

## 3) Run
```
npm install
npm run dev
```
Open http://localhost:3000

## 4) Test
Fill the Internship form and submit. You’ll receive an email with all details and the resume file.

- Uploaded files are stored in `/uploads`.
- A CSV log is saved at `/submissions/applications.csv`.
