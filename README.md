# MindFlow 🧠⚡

MindFlow is a modern, full-stack AI-augmented cognitive health and productivity dashboard. Engineered with React 19, Vite, Express, TypeScript, and Google Gemini AI, MindFlow unites scientifically-backed neuro-productivity protocols - including 90-minute ultradian focus rhythms, Box Breathing, cognitive behavioral therapy (CBT) distortion reframing, and ambient soundscapes - with clinical psychological analysis and automated cloud delivery pipelines.

---

## 🌟 Key Features

### 1. ⏱️ Ultradian Focus Rhythm Timer
- **Science-Backed Work/Rest Cycles**: 90-minute deep focus intervals followed by 20-minute restorative breaks to match human biological ultradian rhythms.
- **Micro-Pacing & Milestone Alerts**: Real-time progress visualization, audio chime milestones, and task tagging during active focus intervals.
- **Focus Achievement Reports**: Automated end-of-session summaries tracking cognitive output, distractions, and energy expenditure.

### 2. 📝 CBT Thought Journal & Distortion Reframer
- **Structured Reframing Matrix**: Guided journal prompts based on Cognitive Behavioral Therapy (CBT) methodology.
- **Cognitive Distortion Detector**: Identifies cognitive pitfalls (e.g., Catastrophizing, All-or-Nothing Thinking, Mind Reading, Emotional Reasoning, Overgeneralization).
- **Dual AI Cognitive Analysis**: Generates constructive reframed thoughts, rational alternative perspectives, and behavioral action steps using Google Gemini AI or local Ollama LLMs.

### 3. 🌬️ Box Breathing & Parasympathetic Reset
- **Guided Visual Pacer**: Interactive 4-4-4-4 autonomic nervous system regulation (Inhale 4s, Hold 4s, Exhale 4s, Hold 4s).
- **Dynamic Wave Animations**: Fluid SVG/Motion visual cues synchronized with breathing cycles to instantly downregulate acute stress and cognitive overload.

### 4. ⚡ Circadian Intent Engine & Energy Tracking
- **Multi-Phase Day Planner**: Context-aware recommendations dynamically adapting to Morning Spark, Midday Peak, Afternoon Dip, and Evening Wind-Down.
- **Energy & Emotion Sliders**: Multi-dimensional subjective logging mapping mood valence against physiological energy.
- **Trend Visualizer**: Dynamic area and bar charts powered by Recharts comparing energy vs. emotional equilibrium across 7-day and 30-day cohorts.

### 5. 💡 Brain Dump & Active Task Prioritizer
- **Rapid Thought Capture**: Frictionless markdown brain dump buffer to offload working memory clutter.
- **Eisenhower Priority Matrix**: Classifies tasks by urgency and impact with instant status progression (Pending, In Progress, Complete).
- **AI Task Decomposition**: Breaks complex, ambiguous objectives into small, low-friction, actionable micro-steps.

### 6. 🎧 Generative Ambient Soundscapes
- **Synthesized Audio Engine**: High-fidelity procedural audio generator with multi-channel volume mixers (Binaural Beats, Rain & Storm, Coffee Shop White Noise, Forest Birds, Cosmic Drone).
- **Focus Entrainment**: Theta and Alpha brainwave frequencies designed to induce calm focus and deep work flow states.

### 7. 🤖 Dual-Engine AI Psychological Insights
- **Google Gemini AI (Cloud)**: Deep synthesis of recent journal entries, habit streaks, energy logs, and task completion velocity into actionable clinical summaries.
- **Local LLM Support (Ollama / Qwen / Llama)**: Complete privacy mode routing inference requests through local Ollama (`http://localhost:11434`) for zero cloud data egress.

### 8. 📊 Consistency & Habit Tracking Hub
- **Habit Progression Grid**: Streak monitoring, completion frequency heatmaps, and customizable routine milestones.
- **Historical Archive Viewer**: Searchable audit logs of previous focus sessions, CBT entries, and mental clarity evaluations.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 19, Vite, TypeScript |
| **Styling & Motion** | TailwindCSS v4, Framer Motion (`motion/react`), Lucide React |
| **Charts & Analytics** | Recharts v3 |
| **Backend API** | Node.js 22, Express, TypeScript |
| **AI & Intelligence** | Google Gemini API (`@google/genai`), Ollama Local LLM (`qwen2.5:7b`) |
| **Database & Auth** | Firebase Auth & Cloud Firestore (optional client sync) + Local Storage |
| **Containerization** | Docker (Multi-stage build), Docker Compose |
| **CI/CD & DevOps** | GitHub Actions (automated lint, build, Docker deploy to AWS EC2) |
| **Reverse Proxy** | Dynamic Nginx Reverse Proxy with custom subdomains |

---

## 📋 Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v20+ or v22 LTS recommended) & **npm**
- **Docker** & **Docker Compose** *(Recommended for containerized execution)*
- *(Optional)* **Google Gemini API Key**: [Get a free API key from Google AI Studio](https://aistudio.google.com/)
- *(Optional)* **Ollama**: [ollama.ai](https://ollama.ai/) for running local inference models

---

## 🚀 Quickstart & Setup Guide

### Option A: Docker Setup (Recommended & Fastest)

The repository includes a production-grade multi-stage Docker configuration serving the client bundle and Express API:

#### 1. Clone the Repository & Configure Environment
```bash
git clone https://github.com/zugger14/mindflow.git
cd mindflow

# Copy environment variables template
cp .env.example .env
```

Set your configuration values in `.env`:
```env
PORT=3020
NODE_ENV=production
GEMINI_API_KEY="your-gemini-api-key-here"
LOCAL_LLM_URL="http://localhost:11434"
LOCAL_LLM_MODEL="qwen2.5:7b"
```

#### 2. Start the Container
```bash
docker compose up -d --build
```
- **Web App**: [http://localhost:3020](http://localhost:3020)
- **Container Name**: `mindflow`
- **Internal Port**: `3020`

#### 3. Inspect Container Logs
```bash
docker logs -f mindflow
```

---

### Option B: Local Development Setup (Native Node.js)

#### 1. Clone the Repository
```bash
git clone https://github.com/zugger14/mindflow.git
cd mindflow
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Configure Local Environment
Create `.env` (or `.env.local` for Vite):
```env
PORT=3000
GEMINI_API_KEY="your-gemini-api-key-here"
LOCAL_LLM_URL="http://localhost:11434"
LOCAL_LLM_MODEL="qwen2.5:7b"
```

#### 4. Run Development Server
```bash
npm run dev
```
- App will run at [http://localhost:3000](http://localhost:3000) with hot module reloading (HMR).

#### 5. Verify Build & Linting
```bash
# Typecheck TypeScript
npm run lint

# Build production bundle
npm run build

# Run automated QA test runner
npm test
```

---

## 🤖 Configuring AI Providers

### Using Google Gemini API (Default Cloud Provider)
1. Generate an API Key at [Google AI Studio](https://aistudio.google.com/).
2. Set `GEMINI_API_KEY="your_api_key"` in `.env`.
3. MindFlow automatically uses Gemini for CBT thought reframing, cognitive distortion categorization, and personalized weekly summaries.

### Using Local Ollama LLM (100% Offline & Private)
1. Install Ollama from [ollama.com](https://ollama.com).
2. Pull the recommended lightweight model:
   ```bash
   ollama run qwen2.5:7b
   ```
3. Ensure Ollama is running on port `11434`:
   ```bash
   curl http://localhost:11434/api/tags
   ```
4. Click the **Local LLM Config** pill in the MindFlow UI to toggle between Gemini and Local inference.

---

## 🚢 CI/CD & Deployment Pipeline

MindFlow features an automated GitHub Actions deployment workflow (`.github/workflows/deploy.yml`):
1. **Validation Stage**: Triggers on pull requests and pushes to `main`. Installs dependencies, runs `npm run lint` for TypeScript validation, and builds production bundles (`npm run build`).
2. **Automated EC2 Deployment**: Connects via SSH (`appleboy/ssh-action`), fetches latest changes from `main`, triggers zero-downtime rolling rebuild (`docker compose up --build -d`), and prunes dangling images automatically.
3. **Nginx Reverse Proxy**: Integrates with the centralized AWS EC2 Nginx reverse proxy configuration to serve traffic on port `3020` or dedicated subdomain routing (`http://mindflow.<domain>/`).

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
