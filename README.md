# MindFlow 🧠⚡

MindFlow is a modern, full-stack AI-augmented cognitive health and productivity operating system. Engineered with React 19, Vite, Express, TypeScript, TailwindCSS, and Google Gemini AI, MindFlow unites scientifically-backed neuro-productivity protocols — including 90-minute ultradian focus rhythms, Box Breathing, cognitive behavioral therapy (CBT) distortion reframing, and ambient soundscapes — with clinical psychological analysis, hybrid local/cloud storage, and automated DevOps delivery pipelines.

🌐 **Live Demo**: [https://mindflow.maharjanshirish.com.np](https://mindflow.maharjanshirish.com.np)

---

## 🌟 Key Features

### 1. ⏱️ Ultradian Focus Rhythm Timer & Neuro-Badge Engine
- **Science-Backed Work/Rest Cycles**: 90-minute deep focus intervals followed by 20-minute restorative breaks to synchronize with human Basic Rest-Activity Cycles (BRAC).
- **Micro-Pacing & Distraction Tracking**: Real-time progress visualization, audio chime milestones, and a dedicated distraction counter to quantify prefrontal cognitive interruptions.
- **Focus Achievement & Badges System**: Unlocks tiered neuro-productivity badges (*Deep Work Guru*, *Flow State Artisan*, *Ultradian Initiate*, *Restorative Master*) based on verified unbroken focus blocks.

### 2. 📝 CBT Thought Journal & Distortion Reframer
- **Structured Reframing Matrix**: Guided journal prompts based on Cognitive Behavioral Therapy (CBT) methodology.
- **Cognitive Distortion Detector**: Classifies cognitive pitfalls (*Catastrophizing*, *All-or-Nothing Thinking*, *Mind Reading*, *Emotional Reasoning*, *Overgeneralization*).
- **Dual AI Cognitive Analysis**: Generates constructive reframed thoughts, rational alternative perspectives, and behavioral action steps using Google Gemini AI or local Ollama LLMs.
- **High-Contrast Dark Mode**: Polished typography and input contrast ensuring typed text remains crisp and legible in both light and dark modes.

### 3. 🌬️ Box Breathing & Parasympathetic Reset
- **Guided Visual Pacer**: Interactive 4-4-4-4 autonomic nervous system regulation (*Inhale 4s, Hold 4s, Exhale 4s, Hold 4s*).
- **Dynamic Wave Animations**: Fluid SVG/Motion visual cues synchronized with breathing cycles to downregulate acute cortisol spikes and mental fatigue.

### 4. ⚡ Circadian Intent Engine & Energy Tracking
- **Context-Aware Day Planner**: Dynamically adapts recommendations across 4 biological phases: *Morning Spark*, *Midday Peak*, *Afternoon Dip*, and *Evening Wind-Down*.
- **Energy & Emotion Sliders**: Multi-dimensional subjective logging mapping mood valence against physiological energy with interactive feedback badges.
- **Trend Visualizer**: Dynamic area and bar charts powered by Recharts comparing energy vs. emotional equilibrium across 7-day and 30-day cohorts.

### 5. 💡 Zeigarnik Brain Dump & Deep Focus Task Manager
- **Rapid Thought Offloader**: Frictionless markdown brain dump buffer to offload working memory clutter and relieve mental loop fatigue.
- **Contextual Thought-to-Task Conversion**: Converts mental clutter directly into prioritized actionable tasks with a single click.
- **Subtask Decomposition**: Breaks complex, ambiguous objectives into small, low-friction micro-steps.

### 6. 🎧 Generative Ambient Soundscapes
- **Synthesized Audio Engine**: High-fidelity procedural audio generator with multi-channel volume mixers (*Binaural Beats*, *Rain & Storm*, *Coffee Shop White Noise*, *Forest Birds*, *Alpha Wave Drones*).
- **Quick-Mix Focus Presets**: One-click curated presets (*Deep Focus*, *Somatic Reset*, *Theta Meditation*) designed to induce calm flow states.

### 7. 🤖 Dual-Engine AI Psychological Insights
- **Google Gemini AI (Cloud)**: Deep clinical synthesis of recent journal entries, habit streaks, energy logs, and task velocity into structured behavioral reports.
- **Local LLM Support (Ollama / Qwen / Llama)**: Complete privacy mode routing inference requests through local Ollama (`http://localhost:11434`) for zero cloud data egress.
- **Retrospective Log Analysis**: Inspect past days via the **Logs Archive Modal** and run retroactive cognitive evaluations on historical data snapshots.

### 8. 📊 Consistency & Habit Tracking Hub
- **30-Day Streak Milestones**: Habit progression grid, daily completion heatmaps, and milestone unlocks (*7-Day Momentum*, *14-Day Neuro-Plasticity*, *21-Day Habit Threshold*, *30-Day Mindflow Mastery*).
- **Historical Archive Viewer**: Searchable audit logs of previous focus sessions, CBT entries, and mental clarity evaluations.

### 9. 💾 Hybrid Storage: Local Storage + Google Cloud Sync
- **Instant Guest Mode (Zero Friction)**: MindFlow works out of the box with **no mandatory account creation**. All daily logs, tasks, sessions, and preferences automatically persist to browser `localStorage`.
- **Optional Google Sign-In with Cloud Firestore**: One-click authentication using Firebase Auth to seamlessly backup and sync entries across all your devices in real-time.
- **Flexible Dismiss / Skip**: If you decline or skip cloud sign-in, you can continue directly to the dashboard with full local storage support.

### 10. 🗑️ Complete Local Data Purge & Dashboard Reset
- **Granular Reset Dialog**: Accessible from the header pill, sync prompt modal, and footer.
- **Comprehensive Wipe**: Clears all local records (energy logs, CBT entries, tasks, brain dumps, focus sessions, achievements, custom models, and theme preferences) back to fresh defaults with a single confirmation.
- **Cloud Safety**: Local resets do not overwrite or destroy remote Firestore backups when authenticated.

### 11. 🧪 Comprehensive Multi-User Isolation & Automated QA Test Lab
- **21-Suite Automated QA Test Runner**: Complete end-to-end test framework covering multi-user data isolation, timer transitions, distraction handling, streak calculations, distortion classification, and Firestore rule compliance.
- **Simulated Personas**: Pre-configured testing profiles (*Dr. Elena Rostova*, *Marcus Vance*, *Amina Patel*) with dedicated data sandboxes and zero cross-contamination.
- **Interactive QA Test Lab Modal**: Live in-app persona switching, synthetic dataset seeding, and instant test suite execution.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 19, Vite, TypeScript |
| **Styling & Motion** | TailwindCSS v4, Framer Motion (`motion/react`), Lucide React |
| **Data Visualization** | Recharts v3 |
| **Backend API** | Node.js 22, Express, TypeScript |
| **AI & Intelligence** | Google Gemini API (`@google/genai`), Ollama Local LLM (`qwen2.5:7b`) |
| **Database & Auth** | Firebase Authentication, Cloud Firestore, Browser `localStorage` |
| **Test Automation** | Custom TypeScript QA Test Runner (21 suites, 100% pass rate) |
| **Containerization** | Docker (Multi-stage build), Docker Compose |
| **CI/CD & DevOps** | GitHub Actions (automated lint, build, Docker deploy to AWS EC2) |
| **Reverse Proxy & SSL** | Nginx Reverse Proxy with Let's Encrypt SSL (`mindflow.maharjanshirish.com.np`) |

---

## 📋 Prerequisites

Before starting, ensure you have:

- **Node.js** (v20+ or v22 LTS recommended) & **npm**
- **Docker** & **Docker Compose** *(Recommended for containerized execution)*
- *(Optional)* **Google Gemini API Key**: [Get a free API key from Google AI Studio](https://aistudio.google.com/)
- *(Optional)* **Ollama**: [ollama.ai](https://ollama.ai/) for running local private inference models

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
PORT=3050
GEMINI_API_KEY="your-gemini-api-key-here"
LOCAL_LLM_URL="http://localhost:11434"
LOCAL_LLM_MODEL="qwen2.5:7b"
```

#### 4. Run Development Server
```bash
npm run dev
```
- App will run at [http://localhost:3050](http://localhost:3050) with hot module reloading (HMR).

#### 5. Verify Build & Run QA Test Suites
```bash
# Typecheck and lint
npm run lint

# Build production bundle
npm run build

# Run automated QA test runner (21 test suites)
npx tsx src/tests/qa-runner.ts --run
```

---

## 🧪 Automated QA Test Suite

MindFlow features a built-in automated QA testing suite covering all cognitive modules and multi-user data isolation:

```bash
npx tsx src/tests/qa-runner.ts --run
```

### Coverage Highlights:
- **Multi-User Data Isolation**: Proves zero data leakage between guest users, live Google authenticated profiles, and simulated test personas (*Dr. Elena Rostova*, *Marcus Vance*, *Amina Patel*).
- **Ultradian Timer Logic**: Validates 90-minute focus and 20-minute restorative state transitions, pause mechanics, and distraction increments.
- **Habit Streaks & Milestone Progress**: Verifies mathematical accuracy of 7-day, 14-day, 21-day, and 30-day streak milestones and score dampening.
- **Cognitive Distortion Classification**: Validates correct mapping of user thoughts to CBT distortion patterns.
- **Firebase Security Rules & Document Isolation**: Verifies collection paths and authentication scoping rules against live Firestore instances.

---

## 🤖 Configuring AI Providers

### Using Google Gemini API (Default Cloud Provider)
1. Generate an API Key at [Google AI Studio](https://aistudio.google.com/).
2. Set `GEMINI_API_KEY="your_api_key"` in `.env`.
3. MindFlow automatically uses Gemini for CBT thought reframing, cognitive distortion categorization, and personalized psychological summaries.

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
1. **Validation Stage**: Triggers on pull requests and pushes to `main`. Installs dependencies, runs TypeScript compilation, executes tests, and builds production bundles (`npm run build`).
2. **Automated EC2 Deployment**: Connects via SSH (`appleboy/ssh-action`), fetches latest changes from `main`, triggers zero-downtime rolling rebuild (`docker compose up --build -d`), and prunes dangling images automatically.
3. **Nginx Reverse Proxy & SSL**: Routes incoming HTTPS traffic through Nginx with automated SSL certificate renewal to serve [https://mindflow.maharjanshirish.com.np](https://mindflow.maharjanshirish.com.np).

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
