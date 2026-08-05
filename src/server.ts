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
// CORS & SOCKET.IO CONFIGURATION (Frontend Vercel / Local)
// -------------------------------------------------------------
const allowedOrigins = '*'; // Mengizinkan semua origin untuk fleksibilitas Dev/Vercel

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST']
  }
});

const brain = new BrainProcessor();

// Store In-Memory untuk Sesi Runtime Engine
const activeSessions = new Map<string, ClassroomRuntimeEngine>();

// Middleware Utama
app.use(express.json());

// Middleware Global Logging (Mencatat semua HTTP Request yang masuk)
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
// API ENDPOINTS (Legacy & Realtime Socket Sync)
// -------------------------------------------------------------

// 1. Endpoint Boot Engine (Sederhana)
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
  console.log('✅ [API RES] Boot berhasil, State:', classState);
  res.json({ success: true, data: classState });
});

// 2. Endpoint Advance Moment (Sederhana)
app.post('/api/v1/advance', (req, res) => {
  console.log('⏩ [API REQ] /api/v1/advance - Memajukan moment...');
  if (classState.system_status !== 'RUNNING') {
    console.warn('⚠️ [API WARN] /api/v1/advance - Gagal: Engine belum di-boot!');
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
  console.log('✅ [API RES] Advance berhasil, Moment saat ini:', classState.current_moment);
  res.json({ success: true, data: classState });
});

// 3. Endpoint Brain AI Ask (RAG Enabled)
app.post('/api/v1/brain/ask', async (req, res) => {
  console.log('🧠 [API REQ] /api/v1/brain/ask - Memproses prompt AI...');
  try {
    const { prompt, currentMoment } = req.body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      console.warn('⚠️ [API WARN] /api/v1/brain/ask - Prompt kosong.');
      return res.status(400).json({
        success: false,
        error: 'Field "prompt" wajib diisi dan berupa teks.'
      });
    }

    const momentContext = currentMoment || classState.current_moment;
    console.log(`💬 Prompt Received: "${prompt.trim()}" | Context: ${momentContext}`);

    const responseText = await brain.processPedagogicalPrompt(prompt, momentContext);
    console.log('✅ [API RES] Respon AI berhasil dibuat.');

    return res.json({
      success: true,
      data: {
        moment: momentContext,
        prompt: prompt.trim(),
        response: responseText
      }
    });
  } catch (error: any) {
    console.error('❌ [BRAIN API ERROR]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Terjadi kesalahan internal pada Brain Processor.'
    });
  }
});

// -------------------------------------------------------------
// CORE BULAENG OS ARCHITECTURE ENDPOINTS (03:00 AM & 07:00 AM)
// -------------------------------------------------------------

// 4. Brain Orchestrator Preparation Endpoint (03:00 AM)
app.post('/api/brain/prepare-day', async (req, res) => {
  console.log('🌅 [API REQ] /api/brain/prepare-day - Menjalankan alur persiapan...');
  try {
    const { group = 'B1' } = req.body;

    const orchestrator = new BrainOrchestrator();
    const episodePackage = await orchestrator.triggerEarlyMorningProcess(group);

    console.log(`✅ [API RES] Persiapan hari selesai untuk grup: ${group}`);
    return res.status(200).json({
      success: true,
      message: `Episode for group ${group} successfully prepared by Brain Orchestrator.`,
      data: episodePackage,
    });
  } catch (error: any) {
    console.error('❌ [ORCHESTRATOR ERROR]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to trigger prepare day workflow.',
    });
  }
});

// 5. Classroom Runtime Engine Endpoint (07:00 AM)
app.post('/api/classroom/session', async (req, res) => {
  console.log(`🏫 [API REQ] /api/classroom/session - Action: ${req.body?.action}`);
  try {
    const { action, sessionId, classId, teacherId } = req.body;

    if (!sessionId) {
      console.warn('⚠️ [API WARN] sessionId tidak diberikan.');
      return res.status(400).json({ success: false, error: 'sessionId is required' });
    }

    let engine = activeSessions.get(sessionId);

    // ACTION: BOOT
    if (action === 'BOOT') {
      if (!classId || !teacherId) {
        console.warn('⚠️ [API WARN] classId atau teacherId kurang untuk BOOT.');
        return res.status(400).json({ success: false, error: 'classId and teacherId are required for BOOT' });
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

      console.log(`✅ [RUNTIME BOOT] Sesi ${sessionId} aktif untuk kelas ${classId}`);
      return res.status(200).json({
        success: true,
        action: 'BOOT',
        message: `Session ${sessionId} booted successfully for class ${classId}`,
      });
    }

    if (!engine) {
      console.warn(`⚠️ [API WARN] Sesi ${sessionId} tidak aktif.`);
      return res.status(404).json({ success: false, error: `Session ${sessionId} is not active` });
    }

    // ACTION: ADVANCE
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

      console.log(`✅ [RUNTIME ADVANCE] Sesi ${sessionId} maju ke moment berikutnya.`);
      return res.status(200).json({
        success: true,
        action: 'ADVANCE',
        message: `Session ${sessionId} advanced to next moment`,
      });
    }

    // ACTION: SHUTDOWN
    if (action === 'SHUTDOWN') {
      const metrics = engine.getMetrics();
      engine.shutdown();
      activeSessions.delete(sessionId);

      classState.system_status = 'ENDED';
      io.emit('state_changed', classState);

      console.log(`🛑 [RUNTIME SHUTDOWN] Sesi ${sessionId} ditutup.`);
      return res.status(200).json({
        success: true,
        action: 'SHUTDOWN',
        metrics,
        message: `Session ${sessionId} closed successfully`,
      });
    }

    return res.status(400).json({ success: false, error: 'Invalid action provided' });

  } catch (error: any) {
    console.error('❌ [RUNTIME ERROR]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Runtime execution error',
    });
  }
});

// -------------------------------------------------------------
// SERVER BINDING & EXPORT FOR VERCEL
// -------------------------------------------------------------
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`🚀 BULAENG OS Server running at http://localhost:${PORT}`);
  });
}

export default app;