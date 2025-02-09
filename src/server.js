const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the public directory
app.use(express.static('public'));

// Endpoint to run the Python script
app.post('/api/generate', (req, res) => {
  const pythonScript = path.join(__dirname, 'python', 'generate_debates.py');
  
  exec(`python3.13 "${pythonScript}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error}`);
      return res.status(500).json({ error: error.message });
    }
    console.log(`Python Output: ${stdout}`);
    res.json({ message: 'Data generated successfully' });
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});