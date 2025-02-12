const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Use Render's dynamic PORT (Ensuring it's correctly set)
const PORT = process.env.PORT || 10000;

// Updated CORS configuration
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:10000', 'https://debatefi-21.onrender.com'],
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

app.use(express.json());

// Serve JSON data directly for testing
app.get('/', (req, res) => {
  const jsonPath = path.join(__dirname, 'public', 'api', 'debates.json');
  
  if (!fs.existsSync(jsonPath)) {
    return res.json({ message: 'No debates data found' });
  }

  try {
    const jsonData = fs.readFileSync(jsonPath, 'utf8');
    res.json(JSON.parse(jsonData));
  } catch (error) {
    res.status(500).json({ error: 'Error reading debates data' });
  }
});

// Serve static API data
app.use('/api', express.static(path.join(__dirname, 'public', 'api')));

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Test API endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running correctly' });
});

// Get existing debates
app.get('/api/debates', (req, res) => {
  const jsonPath = path.join(__dirname, 'public', 'api', 'debates.json');

  if (!fs.existsSync(jsonPath)) {
    return res.status(404).json({ error: 'debates.json not found' });
  }

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
  const pythonScript = path.join(__dirname, 'scripts', 'generate_debates.py');

  if (!fs.existsSync(pythonScript)) {
    console.error('Python script not found at:', pythonScript);
    isGenerating = false;
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
    isGenerating = false;

    if (code !== 0) {
      return res.status(500).json({ error: 'Python script failed', details: scriptError });
    }

    const jsonPath = path.join(__dirname, 'public', 'api', 'debates.json');
    if (!fs.existsSync(jsonPath)) {
      return res.status(500).json({ error: 'debates.json not found after generation' });
    }

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
    isGenerating = false;
    res.status(500).json({ error: 'Failed to start Python process', details: error.message });
  });
});

// Add OPTIONS handler for preflight requests
app.options('*', cors());

// Start server on Render
app.listen(PORT, () => {
  console.log(`\n=== Server Started on ${PORT} ===`);
});
