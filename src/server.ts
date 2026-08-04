import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { BrainProcessor } from './brain/processor';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const brain = new BrainProcessor();

app.use(express.json());

// -------------------------------------------------------------
// SERVING STATIC FILES & INDEX.HTML
// -------------------------------------------------------------
// Menangani pengiriman file statis dari root folder proyek
app.use(express.static(path.join(__dirname, '../')));
app.use(express.static(process.cwd()));

// Route explicit untuk memastikan file index.html langsung dimuat saat membuka http://localhost:3000
app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'index.html'));
});

// -------------------------------------------------------------
// STATE MANAGEMENT & MOMENTS
// -------------------------------------------------------------
// State Sesi Kelas Sederhana di Memori
let classState = {
  session_id: 'SESSION-OFFLINE',
  current_moment: 'Belum Dimulai',
  progress: 0,
  system_status: 'DISCONNECTED'
};

// Daftar Momen Pembelajaran BULAENG OS
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
  console.log('⚡ Client terhubung via Socket.io');
  socket.emit('state_changed', classState);
});

// -------------------------------------------------------------
// API ENDPOINTS
// -------------------------------------------------------------

// 1. Endpoint Boot Engine
app.post('/api/v1/boot', (req, res) => {
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

// 3. Endpoint Brain AI Ask (RAG Enabled)
app.post('/api/v1/brain/ask', async (req, res) => {
  try {
    const { prompt, currentMoment } = req.body;

    // Validasi input prompt
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Field "prompt" wajib diisi dan berupa teks.'
      });
    }

    // Gunakan moment dari request, atau fallback ke state kelas saat ini
    const momentContext = currentMoment || classState.current_moment;

    // Memproses prompt via RAG Knowledge Engine & Gemini API
    const responseText = await brain.processPedagogicalPrompt(prompt, momentContext);

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
// SERVER BINDING
// -------------------------------------------------------------
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 BULAENG OS Server running at http://localhost:${PORT}`);
});