const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Use Render's dynamic PORT
const PORT = process.env.PORT || 3001;

// Use environment variable for frontend origin (so it works locally & on Render)
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'https://debatefi-21.onrender.com';

app.use(cors({
  origin: FRONTEND_ORIGIN,
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

// Serve static API data
app.use('/api', express.static(path.join(__dirname, 'public', 'api')));

// Test API endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running correctly' });
});

// Get existing debates
app.get('/api/debates', (req, res) => {
  const jsonPath = path.join(__dirname, 'public', 'api', 'debates.json');
  try {
    console.log('Reading debates from:', jsonPath);
    const jsonData = fs.readFileSync(jsonPath, 'utf8');
    console.log('Successfully read debates.json');
    res.json(JSON.parse(jsonData));
  } catch (error) {
    console.error('Error reading debates.json:', error);
    res.status(500).json({ error: 'Failed to read debates data' });
  }
});

// Debate Generation
let isGenerating = false;

app.post('/api/generate', async (req, res) => {
  if (isGenerating) {
    return res.status(429).json({ message: 'Generation already in progress' });
  }

  isGenerating = true;
  console.log('\n--- Starting Debate Generation ---');
  const pythonScript = path.join(__dirname, 'python', 'generate_debates.py');

  if (!fs.existsSync(pythonScript)) {
    console.error('Python script not found at:', pythonScript);
    return res.status(500).json({ error: 'Python script not found' });
  }

  const pythonProcess = spawn('python', [pythonScript]);
  let scriptOutput = '', scriptError = '';

  pythonProcess.stdout.on('data', (data) => {
    console.log('Python output:', data.toString());
    scriptOutput += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error('Python error:', data.toString());
    scriptError += data.toString();
  });

  pythonProcess.on('close', (code) => {
    console.log('Python process exited with code:', code);
    if (code !== 0) {
      return res.status(500).json({ error: 'Python script failed', details: scriptError });
    }

    const jsonPath = path.join(__dirname, 'public', 'api', 'debates.json');
    try {
      console.log('Reading generated data from:', jsonPath);
      const jsonData = fs.readFileSync(jsonPath, 'utf8');
      console.log('Successfully read generated data');
      res.json({ message: 'Data generated successfully', output: scriptOutput, data: JSON.parse(jsonData) });
    } catch (error) {
      res.status(500).json({ error: 'Failed to read generated data', details: error.message });
    }
  });

  pythonProcess.on('error', (error) => {
    console.error('Failed to start Python process:', error);
    res.status(500).json({ error: 'Failed to start Python process', details: error.message });
  });

  isGenerating = false;
});

// Start server on Render
app.listen(PORT, () => {
  console.log(`\n=== Server Started on ${PORT} ===`);
});
