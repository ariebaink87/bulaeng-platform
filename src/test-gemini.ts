import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('❌ API Key tidak ditemukan di .env!');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function testGeminiLite() {
  try {
    console.log('🤖 Mengirim request ke gemini-2.0-flash-lite...');
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
    const prompt = 'Halo! Konfirmasi bahwa kamu adalah Gemini 2.0 Flash Lite dan jelaskan peranmu dalam BULAENG Classroom OS secara singkat.';
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    console.log('\n✅ Respons Berhasil Diterima:');
    console.log('--------------------------------------------------');
    console.log(response.text());
    console.log('--------------------------------------------------');
  } catch (error: any) {
    console.error('❌ Terjadi kesalahan saat memanggil API:', error.message || error);
  }
}

testGeminiLite();