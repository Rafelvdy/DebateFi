const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();

// ✅ Use `process.env.PORT` assigned by Render, fallback to `3001` locally
const PORT = process.env.PORT || 3001;

// ✅ Allow all origins (modify if needed for security)
app.use(cors({
  origin: '*', // Change this if needed
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

// ✅ Serve static files correctly
app.use('/api', express.static(path.join(__dirname, 'public', 'api')));

// ✅ Test route to confirm server is running
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running on port ' + PORT });
});

// ✅ Fetch debates from `public/api/debates.json`
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

// ✅ Run Python script when requested
app.post('/api/generate', async (req, res) => {
  if (isGenerating) {
    return res.status(429).json({ message: 'Generation already in progress' });
  }

  try {
    isGenerating = true;
    console.log('\n--- Starting Debate Generation ---');
    const pythonScript = path.join(__dirname, 'python', 'generate_debates.py');

    if (!fs.existsSync(pythonScript)) {
      console.error('Python script not found:', pythonScript);
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
        res.json({ message: 'Data generated successfully', output: scriptOutput, data: JSON.parse(jsonData) });
      } catch (error) {
        res.status(500).json({ error: 'Failed to read generated data', details: error.message });
      }
    });
  } finally {
    isGenerating = false;
  }
});

// ✅ Start server and listen on correct port
app.listen(PORT, () => {
  console.log('\n=== Server Started ===');
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🔹 Test: http://localhost:${PORT}/test`);
  console.log(`🔹 API: http://localhost:${PORT}/api/debates`);
  console.log('===================\n');
});
