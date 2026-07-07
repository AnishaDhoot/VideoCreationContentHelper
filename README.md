# ⚡ SEQUENTIA AI — Sequential Content Pipeline & Script Helper

Sequentia AI is a next-generation content creation cockpit designed for modern digital educators and YouTubers. It compiles a sequential AI pipeline (Editor Node ➔ Scriptwriter Node ➔ Hinglish Translator Node) to transform dry technical drafts into highly engaging, localized Hinglish conversational video scripts, complete with a built-in teleprompter, audio TTS voice generator, and visual storyboard suggestions.

---

## 📋 Table of Contents

- [Features](#-key-features)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Local Setup](#-local-setup--installation)
- [Usage](#-usage)
- [Deployment](#-deployment-guide)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

---

## ✨ Key Features

- **🔗 Interactive Node Graph**: A live visual graph representing the LangGraph state machine flow. Nodes pulse, loading, success-check, or fail in real-time as data streams through them.
- **📝 Grammar & Tone Diff Viewer**: Displays a side-by-side split screen or unified inline comparison (highlighting added/deleted words) of grammar cleanup.
- **⏱️ YouTuber Teleprompter & Calculator**: An auto-scrolling teleprompter guiding vocal reads. Dynamically calculates estimated script read-time based on words-per-minute pacing.
- **🎙️ Dynamic ElevenLabs & Browser TTS**: Synthesizes natural-sounding speech. Fetches voices dynamically from your ElevenLabs dashboard, with automatic graceful fallback to the browser's neural speech engine.
- **🎨 Linguistic Hinglish Highlighter**: Highlights code-switched phrases, color-coding romanized Hindi connectives (pink) and English/tech keywords (cyan).
- **🎬 B-Roll & SFX Storyboard Timeline**: Visualizes visual cues, B-roll timing suggestions, and sound effects overlays in a cinematic timeline.
- **💻 Live Agent Log Console**: Prints execution details from the pipeline in a retro-terminal log box.

---

## 📁 Project Structure

```
sequential workflow/
├── web/                      # Next.js frontend application
│   ├── app/                  # Next.js App Router pages
│   ├── components/           # React components (NodeGraph, Teleprompter, etc.)
│   ├── public/               # Static assets
│   ├── package.json          # Frontend dependencies
│   └── .env.local            # Frontend environment variables
├── project.py                # Python LangGraph pipeline implementation
├── states.py                 # Pipeline state definitions
├── requirements.txt          # Python dependencies
├── .env                      # Python environment variables
└── README.md                 # This file
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router, TypeScript, React)
- **Styling**: Pure Vanilla CSS Modules (Glassmorphic obsidian dark theme, neon glows)
- **Speech Services**: Web Speech API & ElevenLabs REST API
- **LLM API**: Groq Cloud (llama-3.3-70b-versatile)

### Backend
- **Language**: Python 3
- **Orchestration**: LangGraph (Stateful agent workflows)
- **LLM Framework**: LangChain with ChatGroq
- **Environment**: python-dotenv

---

## 🚀 Quick Start

### Option 1: Frontend Only (Recommended)

The fastest way to get started is to run the Next.js frontend, which includes the full pipeline:

```bash
cd web
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000)

### Option 2: Python Backend Only

For testing the pipeline directly via Python:

```bash
pip install -r requirements.txt
python project.py
```

---

## � Local Setup & Installation

### Prerequisites
- Node.js (v18+)
- Python 3.8+
- npm or yarn
- Groq API Key ([Get one here](https://console.groq.com/))
- ElevenLabs API Key (Optional - [Get one here](https://elevenlabs.io/))

### Frontend Setup (Next.js)

1. **Navigate to the web folder**:
   ```bash
   cd web
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env.local` file in the `web` folder:
   ```env
   GROQ_API_KEY="your_groq_api_key"
   ELEVENLABS_API_KEY="your_elevenlabs_api_key_optional"
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

### Python Backend Setup

1. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure environment variables**:
   Create a `.env` file in the root directory:
   ```env
   GROQ_API_KEY="your_groq_api_key"
   ```

3. **Run the pipeline**:
   ```bash
   python project.py
   ```

---

## 📖 Usage

### Using the Web Interface

1. **Input Your Draft**: Paste your technical content or rough draft into the input area
2. **Run the Pipeline**: Click the "Generate Script" button to start the sequential processing
3. **Monitor Progress**: Watch the node graph visualize each stage (Editor → Scriptwriter → Translator)
4. **Review Results**: 
   - Compare original vs edited text in the diff viewer
   - Use the teleprompter to practice your delivery
   - Generate audio with TTS
   - View the storyboard timeline for visual cues

### Using the Python Pipeline Directly

The Python pipeline (`project.py`) implements a three-stage LangGraph:

1. **Editor Node**: Cleans up grammar, removes typos, refines tone
2. **Scriptwriter Node**: Transforms text into an engaging, conversational video script
3. **Translator Node**: Localizes the script into natural Hinglish (Hindi-English mix)

Example output:
```python
result = app.invoke({
    "raw_input": "Your technical content here..."
})
print(result['edited_text'])    # Grammar-corrected version
print(result['script_text'])    # Engaging video script
print(result['final_text'])     # Hinglish localized version
```

---

## ☁️ Deployment Guide

### Vercel Deployment (Frontend)

Deploy the Next.js frontend to production for free:

1. **Push code to GitHub**: Ensure your repository is on GitHub
2. **Import to Vercel**:
   - Sign in to [Vercel](https://vercel.com)
   - Click **"Add New" → "Project"**
   - Import your repository
3. **Configure Project Settings**:
   - **Framework Preset**: Select `Next.js`
   - **Root Directory**: Set to `web` (critical - the Next.js app is in the `web/` subfolder)
4. **Add Environment Variables**:
   - `GROQ_API_KEY` = your actual Groq API key
   - `ELEVENLABS_API_KEY` = your ElevenLabs API key (optional)
5. **Deploy**: Click **"Deploy"**. Vercel will build and deploy in under a minute!

### Python Backend Deployment

For production Python deployment, consider:
- **Railway** or **Render** for simple Python app hosting
- **AWS Lambda** or **Google Cloud Functions** for serverless
- **Docker** for containerized deployment

---

## 🔍 Troubleshooting

### Common Issues

**Issue**: "GROQ_API_KEY not found"
- **Solution**: Ensure `.env.local` (frontend) or `.env` (Python) contains your API key

**Issue**: Module not found errors
- **Solution**: Run `npm install` in the `web/` folder and `pip install -r requirements.txt` in the root

**Issue**: ElevenLabs TTS not working
- **Solution**: This is optional - the app falls back to browser TTS. To use ElevenLabs, add your API key

**Issue**: Pipeline is slow
- **Solution**: Groq is typically fast, but network latency can affect performance. Check your internet connection

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style and conventions
- Add comments for complex logic
- Test thoroughly before submitting
- Update documentation as needed

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- **Groq** for providing fast LLM inference
- **ElevenLabs** for high-quality TTS voices
- **LangChain & LangGraph** for the agent framework
- **Next.js** for the React framework

---

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing documentation
- Review the troubleshooting section above

---

**Built with ❤️ for content creators worldwide**
