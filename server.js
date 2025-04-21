const express = require('express');
const cors = require('cors');
const mercury = require('./parser');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  // Log the time the file was last updated (to verify save time)
  console.log('Server last updated at:', new Date().toLocaleString());
  res.send('Mercury Parser API is running!');
});

app.get('/parser', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing URL parameter' });
  }

  try {
    const result = await mercury.parse(url);
    res.json(result);
  } catch (error) {
    console.error('Error parsing URL:', error);
    res.status(500).json({ error: 'Failed to parse the article' });
  }
});

// Ensure the app listens on the correct dynamic port
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
