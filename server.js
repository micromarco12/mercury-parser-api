const express = require('express');
const mercury = require('./parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/parser', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing URL parameter' });
  }

  try {
    const result = await mercury.parse(url, { contentType: 'html' });
    res.json(result);
  } catch (error) {
    console.error('Parsing error:', error);
    res.status(500).json({ error: 'Failed to parse URL' });
  }
});

app.get('/', (req, res) => {
  res.send('Mercury Parser API is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
