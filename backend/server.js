const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
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

  console.log('New contact message:', newMessage);

  return res.status(200).json({ success: true, message: 'Message received! I will get back to you soon.' });
});

app.get('/api/messages', (req, res) => {
  res.json(readMessages());
});

app.patch('/api/messages/:id/read', (req, res) => {
  const id = Number(req.params.id);
  const messages = readMessages();
  const msg = messages.find(m => m.id === id);
  if (!msg) return res.status(404).json({ error: 'Message not found.' });
  msg.read = true;
  writeMessages(messages);
  res.json({ success: true, message: msg });
});

app.delete('/api/messages/:id', (req, res) => {
  const id = Number(req.params.id);
  let messages = readMessages();
  const exists = messages.some(m => m.id === id);
  if (!exists) return res.status(404).json({ error: 'Message not found.' });
  messages = messages.filter(m => m.id !== id);
  writeMessages(messages);
  res.json({ success: true });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});