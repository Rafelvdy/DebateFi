const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();

// Configure CORS to allow requests from your React app
app.use(cors({
  origin: 'http://localhost:5173', // Vite's default port
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

// Serve static files from the public directory
app.use('/api', express.static(path.join(__dirname, 'public', 'api')));

// Test endpoint to verify server is running
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Endpoint to get current debates
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

app.post('/api/generate', (req, res) => {
  console.log('\n--- Starting Debate Generation ---');
  const pythonScript = path.join(__dirname, 'python', 'generate_debates.py');
  console.log('Python script path:', pythonScript);

  // Check if the Python script exists
  if (!fs.existsSync(pythonScript)) {
    console.error('Python script not found at:', pythonScript);
    return res.status(500).json({ error: 'Python script not found' });
  }

  const pythonProcess = spawn('python', [pythonScript]);
  let scriptOutput = '';
  let scriptError = '';

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
      console.error('Python script failed:', scriptError);
      return res.status(500).json({ 
        error: 'Python script failed', 
        details: scriptError 
      });
    }

    // Try to read the generated data
    const jsonPath = path.join(__dirname, 'public', 'api', 'debates.json');
    try {
      console.log('Reading generated data from:', jsonPath);
      const jsonData = fs.readFileSync(jsonPath, 'utf8');
      console.log('Successfully read generated data');
      const parsedData = JSON.parse(jsonData);
      
      res.json({ 
        message: 'Data generated successfully',
        output: scriptOutput,
        data: parsedData
      });
    } catch (error) {
      console.error('Error reading generated data:', error);
      res.status(500).json({ 
        error: 'Failed to read generated data',
        details: error.message
      });
    }
  });

  pythonProcess.on('error', (error) => {
    console.error('Failed to start Python process:', error);
    res.status(500).json({ 
      error: 'Failed to start Python process',
      details: error.message
    });
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log('\n=== Server Started ===');
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Test endpoint: http://localhost:${PORT}/test`);
  console.log(`Debates endpoint: http://localhost:${PORT}/api/debates`);
  console.log('===================\n');
}); 