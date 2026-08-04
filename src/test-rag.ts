import 'dotenv/config';
import { BrainProcessor } from './brain/processor';

async function testRAGFlow() {
  console.log('🧪 === MENJALANKAN PENGUJIAN RAG BRAIN PROCESSOR ===\n');

  const processor = new BrainProcessor();

  // Data pengujian
  const samplePrompt = "Siswa terlihat kurang bersemangat saat awal pelajaran matematika hari ini.";
  const sampleMoment = "Pembukaan & Apersepsi";

  console.log('📌 Input Uji Coba:');
  console.log(`- Prompt: "${samplePrompt}"`);
  console.log(`- Momen Kelas: "${sampleMoment}"\n`);

  try {
    console.log('⏳ Memproses prompt dengan RAG Knowledge Engine...');
    const response = await processor.processPedagogicalPrompt(samplePrompt, sampleMoment);

    console.log('\n✅ === HASIL RESPONS BRAIN PROCESSOR ===\n');
    console.log(response);
    console.log('\n========================================');
  } catch (error) {
    console.error('❌ Terjadi kesalahan saat pengujian:', error);
  }
}

testRAGFlow();