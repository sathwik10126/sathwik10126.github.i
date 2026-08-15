require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ---- JSON file storage ----
const DB_FILE = path.join(__dirname, 'messages.json');
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, '[]');

function readMessages() {
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}
function writeMessages(messages) {
  fs.writeFileSync(DB_FILE, JSON.stringify(messages, null, 2));
}
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ---- Email transporter ----
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ---- Health check ----
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ---- POST /api/contact ----
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  if (name.trim().length < 2) {
    return res.status(400).json({ error: 'Name is too short.' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }
  if (message.trim().length < 5) {
    return res.status(400).json({ error: 'Message is too short.' });
  }

  const newMessage = {
    id: Date.now(),
    name: name.trim(),
    email: email.trim(),
    message: message.trim(),
    date: new Date().toISOString(),
    read: false
  };

  const messages = readMessages();
  messages.push(newMessage);
  writeMessages(messages);

  console.log('New contact message saved:', newMessage);

  // ---- Send email notification (non-blocking) ----
  const mailOptions = {
    from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    replyTo: email,
    subject: `New portfolio message from ${name}`,
    text: `From: ${name} (${email})\n\nMessage:\n${message}`
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error('Email send failed:', err.message);
    } else {
      console.log('Email sent:', info.response);
    }
  });

  return res.status(200).json({ success: true, message: 'Message received! I will get back to you soon.' });
});

// ---- GET /api/messages ----
app.get('/api/messages', (req, res) => {
  res.json(readMessages());
});

// ---- PATCH /api/messages/:id/read ----
app.patch('/api/messages/:id/read', (req, res) => {
  const id = Number(req.params.id);
  const messages = readMessages();
  const msg = messages.find(m => m.id === id);

  if (!msg) return res.status(404).json({ error: 'Message not found.' });

  msg.read = true;
  writeMessages(messages);
  res.json({ success: true, message: msg });
});

// ---- DELETE /api/messages/:id ----
app.delete('/api/messages/:id', (req, res) => {
  const id = Number(req.params.id);
  let messages = readMessages();
  const exists = messages.some(m => m.id === id);

  if (!exists) return res.status(404).json({ error: 'Message not found.' });

  messages = messages.filter(m => m.id !== id);
  writeMessages(messages);
  res.json({ success: true });
});

// ---- 404 handler ----
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});