import { BrainOrchestrator } from './src/brain/orchestrator/brain.orchestrator';
import { ClassroomRuntimeEngine } from './src/runtime/engine';

async function runEndToEndPipeline() {
  console.log('🚀 === SIMULASI PIPELINE BULAENG OS (END-TO-END) === 🚀\n');

  // 1. TAHAP JAM 03:00 AM — Automated Preparation oleh Brain Orchestrator
  console.log('--- 🌙 [03:00 AM] BRAIN ORCHESTRATION ---');
  const brain = new BrainOrchestrator();
  const preparedPackage = await brain.triggerEarlyMorningProcess('B1');
  console.log(`✅ Episode Prepared: "${preparedPackage.title}" (${preparedPackage.scenes.length} Scenes)`);

  // 2. TAHAP JAM 07:00 AM — Inisialisasi Runtime Engine Saat Kelas Dimulai
  console.log('\n--- ☀️ [07:00 AM] RUNTIME ENGINE INITIALIZATION ---');
  const runtime = new ClassroomRuntimeEngine('session_001', 'class_B1', 'teacher_rosiana');

  // Booting Sesi Pembelajaran
  runtime.boot();

  // Simulasi Perjalanan Pembelajaran di Kelas (Advance Moments)
  console.log('\n--- 🏫 CLASSROOM EXECUTION ---');
  runtime.advanceMoment(); // Scene 1
  runtime.advanceMoment(); // Scene 2
  runtime.advanceMoment(); // Scene 3

  // Mengambil Analytics & Melakukan Shutdown Sesi
  console.log('\n--- 📊 CLOSING & ANALYTICS ---');
  const metrics = runtime.getMetrics();
  console.log('Metrics Summary Generated:', metrics);

  runtime.shutdown();
}

runEndToEndPipeline();