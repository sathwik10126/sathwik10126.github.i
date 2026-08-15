const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running' });
});

app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;

  // Validation
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Here you would typically:
  // 1. Validate email format
  // 2. Send email via service (nodemailer, SendGrid, etc.)
  // 3. Store in database
  // 4. Send confirmation

  console.log('Contact form submission:', { name, email, message });

  res.status(200).json({ message: 'Message received successfully' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
