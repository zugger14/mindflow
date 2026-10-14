import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '2mb' }));

const DEFAULT_GEMINI_KEY = process.env.GEMINI_API_KEY || '';

function getGeminiClient(customApiKey?: string): GoogleGenAI | null {
  const effectiveKey = (customApiKey && customApiKey.trim().length > 5) ? customApiKey.trim() : DEFAULT_GEMINI_KEY;
  if (!effectiveKey || effectiveKey === 'AIzaSy_placeholder_key') {
    return null;
  }
  return new GoogleGenAI({
    apiKey: effectiveKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const DEFAULT_LOCAL_URL = process.env.LOCAL_LLM_URL || 'http://localhost:11434';
const DEFAULT_LOCAL_MODEL = process.env.LOCAL_LLM_MODEL || 'qwen2.5:7b';

function extractJsonFromText(rawText: string): any {
  if (!rawText) return null;
  let cleaned = rawText.trim();
  // Strip markdown code fences if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  // Find first { and last }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  return JSON.parse(cleaned);
}

function generateLocalClinicalAnalysis(data: any) {
  const { energyLogs = [], cbtEntries = [], completedTasks = [], brainDumpThoughts = [], focusSessions = [] } = data;

  const avgEmotion = energyLogs.length
    ? Math.round(energyLogs.reduce((acc: number, l: any) => acc + (l.emotion || 50), 0) / energyLogs.length)
    : 52;
  const avgEnergy = energyLogs.length
    ? Math.round(energyLogs.reduce((acc: number, l: any) => acc + (l.energy || 50), 0) / energyLogs.length)
    : 48;

  const distortionMap: Record<string, number> = {};
  cbtEntries.forEach((entry: any) => {
    (entry.distortions || []).forEach((d: string) => {
      distortionMap[d] = (distortionMap[d] || 0) + 1;
    });
  });

  const topDistortions = Object.keys(distortionMap);
  const primaryDistortion = topDistortions[0] || 'Catastrophizing';

  let mindsetState = 'Balanced Awareness';
  if (avgEnergy < 40 && avgEmotion < 45) {
    mindsetState = 'Somatic Depletion & Cognitive Fatigue';
  } else if (avgEnergy >= 60 && avgEmotion < 50) {
    mindsetState = 'High Arousal with Performance Anxiety';
  } else if (avgEmotion >= 60 && avgEnergy >= 55) {
    mindsetState = 'Grounded Resonance & Sustainable Focus';
  } else if (cbtEntries.length > 2) {
    mindsetState = 'Active Cognitive Processing';
  }

  const distortionInsights = [
    {
      distortion: primaryDistortion,
      triggerContext: cbtEntries[0]?.stressor || 'Heavy perceived workload and fear of unfinished loops',
      antidote: cbtEntries[0]?.reframe || 'Decouple self-worth from instant task completion. Shift attention from prospective worry to current micro-actions.',
    },
    ...(topDistortions[1]
      ? [
          {
            distortion: topDistortions[1],
            triggerContext: 'Expectations around personal efficiency and pacing',
            antidote: 'Allow psychological flexibility: capacity fluctuates with circadian biological rhythms.',
          },
        ]
      : []),
  ];

  return {
    mindsetState,
    overallSummary: `Based on your recent ${energyLogs.length} state logs and cognitive reflections, your somatic energy is trending at ${avgEnergy}% with emotional valence at ${avgEmotion}%. You are actively tracking cognitive distortions like ${primaryDistortion}, demonstrating psychological flexibility while navigating daily demands.`,
    distortionInsights,
    energyRhythmAnalysis: `Your physical energy (${avgEnergy}%) and emotional state (${avgEmotion}%) suggest ${
      avgEnergy < 45 ? 'a need for restorative nervous system down-regulation' : 'a stable baseline suitable for deep 90-minute ultradian focus'
    }. Completing ${focusSessions.length} ultradian rhythm blocks has supported your concentration without over-depleting your reserves.`,
    dailySuggestions: [
      {
        category: 'Nervous System Regulation',
        title: 'Parasympathetic Downregulation',
        actionableAdvice: 'Engage in 2 cycles of 4-4-4-4 Box Breathing before beginning your next high-demand task.',
        rationale: 'Slow, equal-ratio respiration stimulates the vagus nerve, reducing autonomic stress reactivity.',
      },
      {
        category: 'Cognitive Reframing',
        title: 'Cognitive Defusion from Perfectionism',
        actionableAdvice: `Notice automatic thoughts related to "${primaryDistortion}" and label them gently as "mental chatter" rather than objective fact.`,
        rationale: 'Labeling distortions creates psychological distance, diminishing emotional distress.',
      },
      {
        category: 'Ultradian Pacing',
        title: 'Enforce Genuine 20-Minute Rest Cycles',
        actionableAdvice: 'When your 90-minute focus timer concludes, physically stand up and look at a distant point to rest optic nerve tension.',
        rationale: 'Ultradian restorative periods restore brain glucose and neurotransmitter reserves.',
      },
    ],
    groundingMantra: 'I do not have to conquer everything at once; honoring my biological pacing is a strength, not a delay.',
    recommendedBreathPattern: 'Box Breathing (4-4-4-4) for 3 minutes before starting priority tasks.',
  };
}

async function callLocalOllamaOrOpenAI(
  url: string,
  modelName: string,
  prompt: string,
  systemPrompt: string,
  timeoutMs: number = 45000
): Promise<{ success: boolean; data?: any; error?: string }> {
  const cleanUrl = url.replace(/\/+$/, '');

  // 1. Try Ollama Native API: /api/chat with format: "json"
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const ollamaRes = await fetch(`${cleanUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: `${systemPrompt}\nYou MUST reply in valid, parseable JSON matching the requested structure.` },
          { role: 'user', content: prompt },
        ],
        format: 'json',
        stream: false,
        options: {
          temperature: 0.3,
          num_ctx: 4096,
        },
      }),
    });

    clearTimeout(timeout);

    if (ollamaRes.ok) {
      const json = await ollamaRes.json();
      const rawText = json?.message?.content || json?.response;
      const parsed = extractJsonFromText(rawText);
      if (parsed && parsed.overallSummary) {
        return { success: true, data: parsed };
      }
    }
  } catch (err: any) {
    // If not Ollama native, try OpenAI-compatible endpoint next
  }

  // 2. Try OpenAI-compatible API: /v1/chat/completions (LM Studio / vLLM / LocalAI)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);

    const openAiRes = await fetch(`${cleanUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: `${systemPrompt}\nYou MUST reply in valid JSON.` },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      }),
    });

    clearTimeout(timeout);

    if (openAiRes.ok) {
      const json = await openAiRes.json();
      const rawText = json?.choices?.[0]?.message?.content;
      const parsed = extractJsonFromText(rawText);
      if (parsed && parsed.overallSummary) {
        return { success: true, data: parsed };
      }
    }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Local LLM connection failed' };
  }

  return { success: false, error: 'Could not parse structured JSON from local model response.' };
}

// Check local LLM status
app.get('/api/local-llm/status', async (req, res) => {
  const targetUrl = (req.query.url as string) || DEFAULT_LOCAL_URL;
  const cleanUrl = targetUrl.replace(/\/+$/, '');
  const startTime = Date.now();

  try {
    // Check Ollama /api/tags
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const ollamaCheck = await fetch(`${cleanUrl}/api/tags`, { signal: controller.signal }).catch(() => null);
    clearTimeout(timeout);

    if (ollamaCheck && ollamaCheck.ok) {
      const data = await ollamaCheck.json();
      const models = (data?.models || []).map((m: any) => m.name);
      return res.json({
        online: true,
        provider: 'ollama',
        url: cleanUrl,
        latencyMs: Date.now() - startTime,
        models,
        recommendedModel: 'qwen2.5:7b',
        targetHardware: 'MacBook M4 Pro (24GB VRAM)',
      });
    }

    // Check OpenAI compatible /v1/models (LM Studio / vLLM)
    const openAiCheck = await fetch(`${cleanUrl}/v1/models`).catch(() => null);
    if (openAiCheck && openAiCheck.ok) {
      const data = await openAiCheck.json();
      const models = (data?.data || []).map((m: any) => m.id);
      return res.json({
        online: true,
        provider: 'openai-compatible',
        url: cleanUrl,
        latencyMs: Date.now() - startTime,
        models,
        recommendedModel: 'qwen2.5:7b',
        targetHardware: 'MacBook M4 Pro (24GB VRAM)',
      });
    }

    return res.json({
      online: false,
      url: cleanUrl,
      error: `Could not reach local LLM at ${cleanUrl}. Ensure Ollama or your local server is running.`,
      recommendedModel: 'qwen2.5:7b',
      quickStartCommand: 'ollama run qwen2.5:7b',
    });
  } catch (err: any) {
    return res.json({
      online: false,
      url: cleanUrl,
      error: err?.message || 'Connection timeout to local LLM server',
      recommendedModel: 'qwen2.5:7b',
      quickStartCommand: 'ollama run qwen2.5:7b',
    });
  }
});

// Check Gemini API configuration status or test a key
app.get('/api/gemini/status', async (req, res) => {
  const queryKey = req.query.apiKey as string | undefined;
  const client = getGeminiClient(queryKey);
  const hasKey = Boolean(client);

  if (!hasKey) {
    return res.json({
      configured: false,
      model: 'gemini-3.5-flash-lite',
      error: 'No Gemini API key detected. Provide a GEMINI_API_KEY or enter your key in settings.',
    });
  }

  // Quick ping check across available active models
  const pingModels = ['gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
  let lastPingError = '';

  for (const pModel of pingModels) {
    try {
      const testResponse = await client!.models.generateContent({
        model: pModel,
        contents: 'Ping. Respond with single word "OK".',
      });
      if (testResponse?.text) {
        return res.json({
          configured: true,
          model: pModel,
          status: 'online',
          testResponse: testResponse.text.trim(),
        });
      }
    } catch (err: any) {
      lastPingError = err?.message || String(err);
    }
  }

  return res.json({
    configured: true,
    status: 'error',
    model: 'gemini-3.5-flash-lite',
    error: lastPingError || 'Gemini API authentication failed.',
  });
});

// Provide server-configured demo key to client if requested
app.get('/api/gemini/demo-key', (_req, res) => {
  const hasEnvKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5);
  return res.json({
    available: hasEnvKey,
    demoKey: hasEnvKey ? process.env.GEMINI_API_KEY : '',
  });
});

// Primary psychological analysis route
app.post('/api/analyze-logs', async (req, res) => {
  const {
    energyLogs,
    cbtEntries,
    completedTasks,
    brainDumpThoughts,
    focusSessions,
    engine = 'auto', // 'local' | 'cloud' | 'auto'
    localUrl = DEFAULT_LOCAL_URL,
    localModel = DEFAULT_LOCAL_MODEL,
    geminiApiKey,
    targetDate,
    isRetrospective = false,
  } = req.body || {};

  const systemInstruction = `You are an expert cognitive behavioral therapist, neuropsychologist, and compassionate behavioral design specialist for MindFlow.
Your task is to conduct a deep psychological analysis based on the user's recorded logs, and generate personalized evidence-based suggestions for their day.
${isRetrospective && targetDate ? `NOTE: This is a retrospective review specifically focused on the user's logged state on ${targetDate}. Evaluate how they coped, what patterns emerged, and constructive takeaways.` : ''}
You MUST output valid, parseable JSON with the following schema:
{
  "overallSummary": "A 2-3 sentence compassionate psychological synthesis of their current state and cognitive-emotional climate.",
  "mindsetState": "Short 2-4 word diagnosis of current psychological momentum, e.g. Overextended yet Adaptive or Grounded & High Focus",
  "distortionInsights": [
    { "distortion": "Name of distortion", "triggerContext": "Context trigger", "antidote": "Reframing antidote" }
  ],
  "energyRhythmAnalysis": "Analysis of energy vs emotional state trajectories and how their ultradian rhythms are functioning.",
  "dailySuggestions": [
    { "category": "Cognitive Reframing | Nervous System Regulation | Ultradian Pacing | Behavioral Activation", "title": "Title", "actionableAdvice": "Specific micro-action", "rationale": "Clinical rationale" }
  ],
  "groundingMantra": "A clinically grounded, non-toxic positive psychological grounding affirmation for today.",
  "recommendedBreathPattern": "Recommended somatic regulation practice for today."
}`;

  const userPrompt = `
${isRetrospective && targetDate ? `Retrospective Analysis Scope: Date ${targetDate}` : "Daily Analysis Scope: Current Day"}
User's Saved Logs:
1. Emotion & Energy Logs:
${JSON.stringify(energyLogs || [], null, 2)}

2. CBT Cognitive Restructuring Entries:
${JSON.stringify(cbtEntries || [], null, 2)}

3. Tasks Completed / Cognitive Load Items:
${JSON.stringify(completedTasks || [], null, 2)}

4. Brain Dump Distracting Thoughts (Zeigarnik Effect):
${JSON.stringify(brainDumpThoughts || [], null, 2)}

5. Ultradian Rhythm Sessions (90m work / 20m break):
${JSON.stringify(focusSessions || [], null, 2)}

Analyze with CBT, polyvagal theory, and ultradian bio-rhythm principles. Return JSON only.
`;

  // 1. If user requested Local LLM or Auto mode: try Local LLM first
  if (engine === 'local' || engine === 'auto') {
    const localStart = Date.now();
    console.log(`[Local LLM] Attempting local inference via ${localUrl} with model: ${localModel}...`);

    const localTimeout = engine === 'auto' ? 3000 : 45000;
    const localResult = await callLocalOllamaOrOpenAI(localUrl, localModel, userPrompt, systemInstruction, localTimeout);

    if (localResult.success && localResult.data) {
      return res.json({
        success: true,
        analysis: localResult.data,
        source: 'local-llm',
        modelUsed: localModel,
        provider: 'local',
        latencyMs: Date.now() - localStart,
      });
    }

    // If user explicitly mandated local LLM and it failed:
    if (engine === 'local') {
      return res.status(503).json({
        success: false,
        error: localResult.error || `Could not connect to local model ${localModel} at ${localUrl}.`,
        quickHelp: `To run locally on your Mac M4 Pro, run in Terminal: "ollama run ${localModel}"`,
      });
    }

    console.warn(`[Local LLM] Local inference unavailable (${localResult.error}). Falling back to Cloud/Clinical...`);
  }

  // 2. Cloud Gemini
  const geminiClient = getGeminiClient(geminiApiKey);

  if (!geminiClient) {
    if (engine === 'cloud') {
      return res.status(400).json({
        success: false,
        error: 'Gemini API key is not configured.',
        quickHelp: 'Please set GEMINI_API_KEY in your .env file or enter your Gemini API key in the AI Settings dialog.',
      });
    }
  } else {
    const schema = {
      type: Type.OBJECT,
      properties: {
        overallSummary: { type: Type.STRING },
        mindsetState: { type: Type.STRING },
        distortionInsights: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              distortion: { type: Type.STRING },
              triggerContext: { type: Type.STRING },
              antidote: { type: Type.STRING },
            },
            required: ['distortion', 'triggerContext', 'antidote'],
          },
        },
        energyRhythmAnalysis: { type: Type.STRING },
        dailySuggestions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              title: { type: Type.STRING },
              actionableAdvice: { type: Type.STRING },
              rationale: { type: Type.STRING },
            },
            required: ['category', 'title', 'actionableAdvice', 'rationale'],
          },
        },
        groundingMantra: { type: Type.STRING },
        recommendedBreathPattern: { type: Type.STRING },
      },
      required: [
        'overallSummary',
        'mindsetState',
        'distortionInsights',
        'energyRhythmAnalysis',
        'dailySuggestions',
        'groundingMantra',
        'recommendedBreathPattern',
      ],
    };

    const modelsToTry = [
      'gemini-3.5-flash-lite',
      'gemini-3.8-flash',
      'gemini-flash-latest',
      'gemini-2.5-flash',
    ];
    let lastCloudError = '';

    for (const modelName of modelsToTry) {
      try {
        const response = await geminiClient.models.generateContent({
          model: modelName,
          contents: userPrompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: schema,
          },
        });

        if (response?.text) {
          const parsed = JSON.parse(response.text.trim());
          return res.json({ success: true, analysis: parsed, source: 'ai', modelUsed: modelName });
        }
      } catch (err: any) {
        lastCloudError = err?.message || String(err);
        console.warn(`Cloud model ${modelName} encountered: ${lastCloudError}. Trying next fallback...`);
      }
    }

    // If user explicitly chose Gemini (cloud) and it failed, do not silently pretend it worked with local synthesis
    if (engine === 'cloud') {
      return res.status(502).json({
        success: false,
        error: `Gemini API call failed: ${lastCloudError}`,
        quickHelp: 'Please check your Gemini API key validity and network connection, or switch to Local LLM mode.',
      });
    }
  }

  // 3. Fallback Clinical Synthesizer (Only for auto mode or when both local and cloud are offline)
  const localAnalysis = generateLocalClinicalAnalysis({
    energyLogs,
    cbtEntries,
    completedTasks,
    brainDumpThoughts,
    focusSessions,
  });
  return res.json({ success: true, analysis: localAnalysis, source: 'clinical-synthesizer' });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
