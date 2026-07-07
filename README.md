# ⚡ SEQUENTIA AI — Sequential Content Pipeline & Script Helper

Sequentia AI is a next-generation content creation cockpit designed for modern digital educators and YouTubers. It compiles a sequential AI pipeline (Editor Node ➔ Scriptwriter Node ➔ Hinglish Translator Node ➔ AI Analyzer Node) to transform dry technical drafts into highly engaging, localized Hinglish conversational video scripts, complete with a built-in teleprompter, audio TTS voice generator, and visual storyboard suggestions.

---

## ✨ Key Features

*   **🔗 Interactive Node Graph**: A live visual graph representing the LangGraph state machine flow. Nodes pulse, loading, success-check, or fail in real-time as data streams through them.
*   **📝 Grammar & Tone Diff Viewer**: Displays a side-by-side split screen or unified inline comparison (highlighting added/deleted words) of grammar cleanup.
*   **⏱️ YouTuber Teleprompter & Calculator**: An auto-scrolling teleprompter guiding vocal reads. Dynamically calculates estimated script read-time based on words-per-minute pacing.
*   **🎙️ Dynamic ElevenLabs & Browser TTS**: Synthesizes natural-sounding speech. Fetches voices dynamically from your ElevenLabs dashboard, with automatic graceful fallback to the browser's neural speech engine.
*   **🎨 Linguistic Hinglish Highlighter**: Highlights code-switched phrases, color-coding romanized Hindi connectives (pink) and English/tech keywords (cyan).
*   **🎬 B-Roll & SFX Storyboard timeline**: Visualizes visual cues, B-roll timing suggestions, and sound effects overlays in a cinematic timeline.
*   **💻 Live Agent Log Console**: Prints execution details from the pipeline in a retro-terminal log box.

---

## 🛠️ Tech Stack

*   **Frontend**: Next.js 15 (App Router, TypeScript, React)
*   **Styling**: Pure Vanilla CSS Modules (Glassmorphic obsidian dark theme, neon glows, scroll locked workspace)
*   **Speech Services**: Web Speech API & ElevenLabs REST API
*   **LLM API**: Groq Cloud (llama-3.3-70b-versatile)
*   **Original Pipeline Backend**: Python 3 (LangGraph, LangChain, ChatGroq)

---

## 🚀 Local Setup & Installation

### Prerequisites
*   Node.js (v18+)
*   npm

### Frontend Configuration (Next.js)

1.  Navigate into the `web` folder:
    ```bash
    cd web
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a local environment configuration file:
    Create a file named `.env.local` inside the `web` folder:
    ```env
    GROQ_API_KEY="your_groq_api_key"
    ELEVENLABS_API_KEY="your_elevenlabs_api_key_optional"
    ```
4.  Run the local development server:
    ```bash
    npm run dev
    ```
5.  Open **[http://localhost:3000](http://localhost:3000)** in your browser!

---

## ☁️ Vercel Deployment Guide

To deploy the cockpit to production for free on Vercel:

1.  **Push Your Code to GitHub**: (Already complete!)
2.  **Import to Vercel**:
    *   Sign in to [Vercel](https://vercel.com).
    *   Click **"Add New" ➔ "Project"**.
    *   Import your `VideoCreationContentHelper` repository.
3.  **Configure Project Settings**:
    *   **Framework Preset**: Select `Next.js`.
    *   **Root Directory**: Set this to **`web`** (important since the Next.js app sits in the `web/` subfolder).
4.  **Add Environment Variables**:
    *   In the project configuration panel, add the following Keys and Values:
        *   `GROQ_API_KEY` = `your_actual_groq_api_key`
        *   `ELEVENLABS_API_KEY` = `your_elevenlabs_api_key` (optional)
5.  **Deploy**:
    *   Click **"Deploy"**. Vercel will build the TS routes, compile static pages, and deploy your live dashboard in under a minute!
