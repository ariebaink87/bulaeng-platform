import dotenv from 'dotenv';
// Muat variabel lingkungan dari .env di baris paling pertama
dotenv.config();

import express, { Request, Response } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

import { ClassroomRuntimeEngine } from './runtime/engine';
import { ClassroomPresenter } from './experience/presenter';
import { PresentationAdapter } from './presentation/adapter';
import { ClassroomMoment } from './contracts/moment';

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// ---------------------------------------------------------
// INISIALISASI ENGINE & PRESENTER
// ---------------------------------------------------------
const os = new ClassroomRuntimeEngine('session-202', 'class-b2', 'teacher-888');
const presenter = new ClassroomPresenter(os);

// Load Contoh Rencana Pembelajaran
const initialPlan: ClassroomMoment[] = [
  {
    momentId: 'm-1',
    title: 'Orientasi Masalah & Diskusi Awal',
    type: 'PRESENTATION',
    durationSeconds: 300,
    payload: {},
    isRequired: true,
  },
  {
    momentId: 'm-2',
    title: 'Pengerjaan Tugas Kelompok',
    type: 'QUIZ',
    durationSeconds: 600,
    payload: {},
    isRequired: true,
  },
];
os.orchestrator.loadPlan(initialPlan);

// Helper untuk Broadcast UI State via WebSocket
const broadcastState = () => {
  const uiState = presenter.getUIState();
  const payload = PresentationAdapter.toApiResponse(uiState);
  io.emit('state_changed', payload);
  return payload;
};

// ---------------------------------------------------------
// 1. REST API ENDPOINTS
// ---------------------------------------------------------

// GET: Cek Status / Payload UI State
app.get('/api/v1/state', (_req: Request, res: Response) => {
  const uiState = presenter.getUIState();
  const payload = PresentationAdapter.toApiResponse(uiState);
  res.json(payload);
});

// POST: Boot Engine
app.post('/api/v1/boot', (_req: Request, res: Response) => {
  os.boot();
  const payload = broadcastState();
  res.json({ message: 'Engine booted successfully', payload });
});

// POST: Advance Moment (Lanjut Momen Berikutnya)
app.post('/api/v1/advance', (_req: Request, res: Response) => {
  os.advanceMoment();
  const payload = broadcastState();
  res.json({ message: 'Advanced to next moment', payload });
});

// POST: Tanya AI Brain (Fase 2 Integrasi LLM)
app.post('/api/v1/brain/ask', async (req: Request, res: Response): Promise<void> => {
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    res.status(400).json({ error: 'Prompt tidak boleh kosong dan harus berupa string.' });
    return;
  }

  // Safe property extraction (mendukung snake_case & camelCase)
  const uiState = presenter.getUIState() as Record<string, any>;
  const currentMoment = uiState.current_moment ?? uiState.currentMoment ?? 'Umum';

  try {
    const brain = os.brain as any;
    let aiResponse: string;

    if (brain && typeof brain.processPedagogicalPrompt === 'function') {
      aiResponse = await brain.processPedagogicalPrompt(prompt, currentMoment);
    } else {
      aiResponse = `[BRAIN OFFLINE]: Method processor belum terhubung. Prompt: "${prompt}"`;
    }

    res.json({
      status: 'success',
      prompt,
      moment: currentMoment,
      response: aiResponse,
    });
  } catch (error) {
    console.error('❌ Error processing AI prompt:', error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal memproses prompt di AI Brain.',
    });
  }
});

// ---------------------------------------------------------
// 2. WEBSOCKET GATEWAY
// ---------------------------------------------------------
io.on('connection', (socket) => {
  console.log(`⚡ [WEBSOCKET] Client Connected: ${socket.id}`);

  const uiState = presenter.getUIState();
  socket.emit('state_changed', PresentationAdapter.toApiResponse(uiState));

  socket.on('disconnect', () => {
    console.log(`❌ [WEBSOCKET] Client Disconnected: ${socket.id}`);
  });
});

// ---------------------------------------------------------
// 3. START SERVER
// ---------------------------------------------------------
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n🚀 [BULAENG OS SERVER] Running on http://localhost:${PORT}`);
  console.log(`🔑 [API KEY STATUS] Loaded Key: ${process.env.GEMINI_API_KEY ? 'OK (Terdeteksi)' : 'KOSONG (Cek .env)'}`);
  console.log(`🌐 REST API State Endpoint : http://localhost:${PORT}/api/v1/state`);
  console.log(`⚡ WebSocket Gateway Active  : ws://localhost:${PORT}\n`);
});