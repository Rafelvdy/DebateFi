const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();

// Allowed frontend origins
const allowedOrigins = [
  'http://localhost:5173', // Local development
  'https://your-frontend-service.onrender.com' // Replace with your deployed frontend URL
];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

// Serve static files
app.use('/api', express.static(path.join(__dirname, 'public', 'api')));

// Test route to check if the server is running
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running successfully!' });
});

// Fetch existing debates
app.get('/api/debates', (req, res) => {
  const jsonPath = path.join(__dirname, 'public', 'api', 'debates.json');
  try {
    console.log('Reading debates from:', jsonPath);
    const jsonData = fs.readFileSync(jsonPath, 'utf8');
    res.json(JSON.parse(jsonData));
  } catch (error) {
    console.error('Error reading debates.json:', error);
    res.status(500).json({ error: 'Failed to read debates data' });
  }
});

let isGenerating = false;

// Generate debates using Python script
app.post('/api/generate', async (req, res) => {
  if (isGenerating) {
    return res.status(429).json({ message: 'Generation already in progress' });
  }

  try {
    isGenerating = true;
    console.log('Starting Debate Generation...');
    const pythonScript = path.join(__dirname, 'python', 'generate_debates.py');

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
      if (code !== 0) {
        console.error('Python script failed:', scriptError);
        return res.status(500).json({ error: 'Python script failed', details: scriptError });
      }

      const jsonPath = path.join(__dirname, 'public', 'api', 'debates.json');
      try {
        console.log('Reading generated data from:', jsonPath);
        const jsonData = fs.readFileSync(jsonPath, 'utf8');
        res.json({ message: 'Data generated successfully', output: scriptOutput, data: JSON.parse(jsonData) });
      } catch (error) {
        res.status(500).json({ error: 'Failed to read generated data', details: error.message });
      }
    });

    pythonProcess.on('error', (error) => {
      console.error('Failed to start Python process:', error);
      res.status(500).json({ error: 'Failed to start Python process', details: error.message });
    });
  } finally {
    isGenerating = false;
  }
});

// Ensure server listens on Render's assigned port
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
