import 'dotenv/config';
import express from 'express';
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

// Inisialisasi Engine Instansiasi Global untuk Sesi Aktif
const os = new ClassroomRuntimeEngine('session-202', 'class-b2', 'teacher-888');
const presenter = new ClassroomPresenter(os);

// Load contoh Rencana Pembelajaran
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

// ---------------------------------------------------------
// 1. REST API ENDPOINTS
// ---------------------------------------------------------

// GET: Cek Status / Payload UI State
app.get('/api/v1/state', (req, res) => {
  const uiState = presenter.getUIState();
  const payload = PresentationAdapter.toApiResponse(uiState);
  res.json(payload);
});

// POST: Boot Engine
app.post('/api/v1/boot', (req, res) => {
  os.boot();
  const uiState = presenter.getUIState();
  const payload = PresentationAdapter.toApiResponse(uiState);
  
  io.emit('state_changed', payload);
  res.json({ message: 'Engine booted successfully', payload });
});

// POST: Advance Moment (Lanjut Momen Berikutnya)
app.post('/api/v1/advance', (req, res) => {
  os.advanceMoment();
  const uiState = presenter.getUIState();
  const payload = PresentationAdapter.toApiResponse(uiState);

  io.emit('state_changed', payload);
  res.json({ message: 'Advanced to next moment', payload });
});

// POST: Tanya AI Brain (Fase 2 Integrasi LLM)
// POST: Tanya AI Brain (Fase 2 Integrasi LLM)
app.post('/api/v1/brain/ask', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt tidak boleh kosong.' });
  }

  // Mengambil state UI dan menggunakan fallback safe access
  const uiState = presenter.getUIState() as any;
  const currentMoment = uiState.current_moment || uiState.currentMoment || 'Umum';

  // Memanggil method brain dengan type bypass
  const brain = os.brain as any;
  const aiResponse = typeof brain.processPedagogicalPrompt === 'function'
    ? await brain.processPedagogicalPrompt(prompt, currentMoment)
    : `[BRAIN OFFLINE]: Method processor belum terhubung. Prompt: "${prompt}"`;

  res.json({
    status: 'success',
    prompt,
    moment: currentMoment,
    response: aiResponse,
  });
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
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`\n🚀 [BULAENG OS SERVER] Running on http://localhost:${PORT}`);
  console.log(`🌐 REST API State Endpoint : http://localhost:${PORT}/api/v1/state`);
  console.log(`⚡ WebSocket Gateway Active  : ws://localhost:${PORT}\n`);
});