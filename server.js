const express = require('express');
const cors = require('cors');
const mercury = require('./parser');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
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

// ✅ Updated here: use process.env.PORT for Render compatibility
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
