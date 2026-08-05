import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import cors from 'cors';
import { BrainProcessor } from './brain/processor';
import { BrainOrchestrator } from './brain/orchestrator/brain.orchestrator';
import { ClassroomRuntimeEngine } from './runtime/engine';

const app = express();
const server = http.createServer(app);

// -------------------------------------------------------------
// CORS & SOCKET.IO CONFIGURATION (Vercel Serverless Ready)
// -------------------------------------------------------------
const allowedOrigins = [
  'https://bulaeng-app-flqk.vercel.app',
  'https://bulaeng-platform-omega.vercel.app',
  'http://localhost:3000',
  'http://localhost:5000'
];

const checkCorsOrigin = (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
  if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
    callback(null, true);
  } else {
    callback(null, true);
  }
};

app.use(cors({
  origin: checkCorsOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

const io = new Server(server, {
  cors: {
    origin: checkCorsOrigin,
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['polling', 'websocket'],
  path: '/socket.io/',
  pingTimeout: 60000,
  pingInterval: 25000,
  allowEIO3: true
});

const brain = new BrainProcessor();
const activeSessions = new Map<string, ClassroomRuntimeEngine>();

app.use(express.json());

app.use((req, res, next) => {
  console.log(`🌐 [HTTP REQUEST] ${req.method} ${req.url}`);
  next();
});

// -------------------------------------------------------------
// SERVING STATIC FILES & INDEX.HTML
// -------------------------------------------------------------
app.use(express.static(path.join(__dirname, '../')));
app.use(express.static(process.cwd()));

app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'index.html'));
});

// -------------------------------------------------------------
// STATE MANAGEMENT & MOMENTS
// -------------------------------------------------------------
let classState = {
  session_id: 'SESSION-OFFLINE',
  current_moment: 'Belum Dimulai',
  progress: 0,
  system_status: 'DISCONNECTED'
};

const MOMENTS = [
  'Pembukaan & Apersepsi',
  'Eksplorasi Konsep',
  'Diskusi & Kolaborasi Kelompok',
  'Presentasi & Unjuk Kerja',
  'Refleksi & Evaluasi'
];
let currentMomentIndex = 0;

// -------------------------------------------------------------
// SOCKET.IO REALTIME EVENTS
// -------------------------------------------------------------
io.on('connection', (socket) => {
  console.log(`⚡ [SOCKET.IO] Client terhubung ID: ${socket.id}`);
  socket.emit('state_changed', classState);

  socket.on('disconnect', () => {
    console.log(`❌ [SOCKET.IO] Client terputus ID: ${socket.id}`);
  });
});

// -------------------------------------------------------------
// API ENDPOINTS
// -------------------------------------------------------------

// 0. Endpoint Setup Initial (FIX Error 404 Not Found)
app.post('/api/v1/setup', (req, res) => {
  console.log('⚙️ [API REQ] /api/v1/setup - Inisialisasi setup...');
  res.json({
    success: true,
    message: 'System setup initialized successfully',
    data: {
      status: 'READY',
      universe: 'Dunia Hewan',
      class: 'a',
      state: classState
    }
  });
});

// 1. Endpoint Boot Engine
app.post('/api/v1/boot', (req, res) => {
  console.log('🚀 [API REQ] /api/v1/boot - Memulai sesi kelas baru...');
  currentMomentIndex = 0;
  classState = {
    session_id: `SES-${Math.floor(1000 + Math.random() * 9000)}`,
    current_moment: MOMENTS[currentMomentIndex],
    progress: 20,
    system_status: 'RUNNING'
  };

  io.emit('state_changed', classState);
  res.json({ success: true, data: classState });
});

// 2. Endpoint Advance Moment
app.post('/api/v1/advance', (req, res) => {
  console.log('⏩ [API REQ] /api/v1/advance - Memajukan moment...');
  if (classState.system_status !== 'RUNNING') {
    return res.status(400).json({ success: false, message: 'Engine belum di-boot!' });
  }

  if (currentMomentIndex < MOMENTS.length - 1) {
    currentMomentIndex++;
    classState.current_moment = MOMENTS[currentMomentIndex];
    classState.progress = Math.min(100, (currentMomentIndex + 1) * 20);
  } else {
    classState.current_moment = 'Kelas Selesai 🎯';
    classState.progress = 100;
    classState.system_status = 'ENDED';
  }

  io.emit('state_changed', classState);
  res.json({ success: true, data: classState });
});

// 3. Endpoint Brain AI Ask
app.post('/api/v1/brain/ask', async (req, res) => {
  try {
    const { prompt, currentMoment } = req.body;
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ success: false, error: 'Field "prompt" wajib diisi.' });
    }

    const momentContext = currentMoment || classState.current_moment;
    const responseText = await brain.processPedagogicalPrompt(prompt, momentContext);

    return res.json({
      success: true,
      data: { moment: momentContext, prompt: prompt.trim(), response: responseText }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Brain Orchestrator Endpoint
app.post('/api/brain/prepare-day', async (req, res) => {
  try {
    const { group = 'B1' } = req.body;
    const orchestrator = new BrainOrchestrator();
    const episodePackage = await orchestrator.triggerEarlyMorningProcess(group);

    return res.status(200).json({
      success: true,
      message: `Episode for group ${group} successfully prepared.`,
      data: episodePackage,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Classroom Runtime Engine Endpoint
app.post('/api/classroom/session', async (req, res) => {
  try {
    const { action, sessionId, classId, teacherId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'sessionId is required' });
    }

    let engine = activeSessions.get(sessionId);

    if (action === 'BOOT') {
      if (!classId || !teacherId) {
        return res.status(400).json({ success: false, error: 'classId and teacherId required for BOOT' });
      }

      engine = new ClassroomRuntimeEngine(sessionId, classId, teacherId);
      engine.boot();
      activeSessions.set(sessionId, engine);

      currentMomentIndex = 0;
      classState = {
        session_id: sessionId,
        current_moment: MOMENTS[currentMomentIndex],
        progress: 20,
        system_status: 'RUNNING'
      };
      io.emit('state_changed', classState);

      return res.status(200).json({
        success: true,
        action: 'BOOT',
        message: `Session ${sessionId} booted successfully`,
      });
    }

    if (!engine) {
      return res.status(404).json({ success: false, error: `Session ${sessionId} is not active` });
    }

    if (action === 'ADVANCE') {
      engine.advanceMoment();
      if (currentMomentIndex < MOMENTS.length - 1) {
        currentMomentIndex++;
        classState.current_moment = MOMENTS[currentMomentIndex];
        classState.progress = Math.min(100, (currentMomentIndex + 1) * 20);
      } else {
        classState.current_moment = 'Kelas Selesai 🎯';
        classState.progress = 100;
        classState.system_status = 'ENDED';
      }
      io.emit('state_changed', classState);

      return res.status(200).json({ success: true, action: 'ADVANCE' });
    }

    if (action === 'SHUTDOWN') {
      const metrics = engine.getMetrics();
      engine.shutdown();
      activeSessions.delete(sessionId);
      classState.system_status = 'ENDED';
      io.emit('state_changed', classState);

      return res.status(200).json({ success: true, action: 'SHUTDOWN', metrics });
    }

    return res.status(400).json({ success: false, error: 'Invalid action provided' });

  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// -------------------------------------------------------------
// EXPORT HANDLER UNTUK VERCEL
// -------------------------------------------------------------
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`🚀 BULAENG OS Server running at http://localhost:${PORT}`);
  });
}

export default function handler(req: any, res: any) {
  server.emit('request', req, res);
}