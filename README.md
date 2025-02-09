# **DebateFi - Crypto Twitter Debate Analyser**

**DebateFi** is an intelligent system designed to identify, analyze, and summarize debates happening on **Crypto Twitter**. This tool extracts key discussions, evaluates sentiment, and identifies real-world events influencing the conversation. It integrates **OpenAI API** for generating insights and **Twitter API** for fetching debates.

## 🚀 **Features**
- **Real-time Twitter Analysis:** Fetches trending crypto debates from influential accounts.
- **AI-Powered Summaries:** Uses OpenAI to generate concise and informative summaries.
- **Sentiment Scoring:** Evaluates how bullish or bearish the debate is.
- **Engagement Metrics:** Displays likes, retweets, and replies for each debate.
- **Technical and Market Impact:** Identifies whether the debate influences market trends or blockchain technology adoption.

## 📦 **Project Structure**
```bash
DebateFi/
│── backend/
│   ├── python/
│   │   ├── generate_debates.py # Fetches and summarizes debates
│   │   ├── requirements.txt  # Python dependencies
│   ├── server.js  # Backend API for the frontend
│── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/  # Main pages
│   │   ├── App.tsx  # Main application entry
│   ├── package.json  # Frontend dependencies
│   ├── tsconfig.json  # TypeScript configuration
│── output.json  # Stores the latest analyzed debates
│── README.md  # This file
│── .gitignore  # Ignores unnecessary files
```

## 🛠 **Setup & Installation**
### **Backend (Python)**
1. **Clone the repository:**
   ```sh
   git clone https://github.com/Rafelvdy/DebateFi.git
   cd DebateFi
   ```

2. **Create a virtual environment and activate it:**
   ```sh
   python -m venv venv
   source venv/bin/activate  # Mac/Linux
   venv\Scripts\activate  # Windows
   ```

3. **Install dependencies:**
   ```sh
   pip install -r requirements.txt
   ```

4. **Set environment variables:**
   - Create a `.env` file in the `python/` directory with:
     ```
     OPENAI_API_KEY=your-openai-key
     TWITTER_API_KEY=your-twitter-key
     ```

5. **Run the debate analysis script:**
   ```sh
   python python/generate_debates.py
   ```

### **Frontend (React + TypeScript)**
1. **Install Node.js** (if not installed) from [Node.js official site](https://nodejs.org/).

2. **Navigate to the frontend directory:**
   ```sh
   cd frontend
   ```

3. **Install dependencies:**
   ```sh
   npm install
   ```

4. **Run the development server:**
   ```sh
   npm run dev
   ```

5. **Access the frontend** at:
   ```
   http://localhost:5173
   ```

## 🌍 **Deployment Guide**
### **Backend Deployment (Render)**
1. **Create a new background worker on Render.**
2. **Connect the GitHub repository.**
3. **Set the following environment variables in Render:**
   ```
   OPENAI_API_KEY=your-openai-key
   TWITTER_API_KEY=your-twitter-key
   ```
4. **Deploy the background worker.**

### **Frontend Deployment (Render/Vercel)**
1. **Create a new frontend web service.**
2. **Select the repository and branch (`main`).**
3. **Set build commands:**
   ```
   npm install
   npm run build
   ```
4. **Set output directory to `dist/`.**
5. **Deploy and get your frontend live.**

## 📌 **Troubleshooting**
- **NPM not found?** Ensure you have [Node.js installed](https://nodejs.org/).
- **Port binding issues?** Ensure the backend runs as a background worker in Render.
- **Dependencies conflict?** Use:
  ```sh
  pip install --upgrade pip
  ```

## 💡 **Future Improvements**
- **Enhanced Sentiment Analysis** with more sophisticated models.
- **More Crypto Insights** including price impact of debates.
- **Live Tweet Monitoring** for real-time alerts.

## 🤝 **Contributing**
- Fork the repository and create a new branch.
- Submit a pull request with detailed changes.

## 📄 **License**
This project is licensed under the **MIT License**.

