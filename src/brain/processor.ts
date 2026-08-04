import { GoogleGenAI } from '@google/genai';
import { KnowledgeEngine } from '../knowledge';

export class BrainProcessor {
  private ai: GoogleGenAI | null = null;

  private getClient(): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return null;
    }
    if (!this.ai) {
      this.ai = new GoogleGenAI({ apiKey });
    }
    return this.ai;
  }

  /**
   * Helper internal untuk menangani auto-retry jika terkena Rate Limit (HTTP 429)
   */
  private async executeWithRetry(
    client: GoogleGenAI,
    params: any,
    retries = 1,
    defaultDelayMs = 3000
  ): Promise<any> {
    let currentDelay = defaultDelayMs;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await client.models.generateContent(params);
      } catch (error: any) {
        const errorStr = JSON.stringify(error);
        const isRateLimit =
          error?.status === 429 ||
          errorStr.includes('429') ||
          errorStr.includes('RESOURCE_EXHAUSTED') ||
          error?.message?.includes('429');

        if (isRateLimit && attempt < retries) {
          const retryMatch = errorStr.match(/"retryDelay"\s*:\s*"(\d+)s"/);
          if (retryMatch && retryMatch[1]) {
            currentDelay = parseInt(retryMatch[1], 10) * 1000 + 1000;
          }

          console.warn(
            `⚠️ [BRAIN] Rate limit (429) terdeteksi. Mencoba ulang dalam ${Math.round(currentDelay / 1000)} detik... (Percobaan ${attempt + 1}/${retries})`
          );

          await new Promise((resolve) => setTimeout(resolve, currentDelay));
          currentDelay *= 2;
        } else {
          throw error;
        }
      }
    }
  }

  /**
   * Mengolah perintah atau pertanyaan pedagogis dari guru/siswa
   * Dilengkapi dengan RAG Knowledge Engine berbasis momen kelas
   */
  public async processPedagogicalPrompt(
    prompt: string,
    currentMoment: string = 'Pembukaan & Apersepsi'
  ): Promise<string> {
    // Retrievable Context dari Knowledge Engine
    const ragContext = KnowledgeEngine.getContextByMoment(currentMoment);

    try {
      const client = this.getClient();

      if (!client) {
        return `🤖 [BRAIN OFFLINE MODE]\n${ragContext}\n\nRespon simulasi untuk prompt: "${prompt}" (API Key belum dikonfigurasi).`;
      }

      // Memanggil Gemini API dengan RAG Context + Auto-Retry
      const response = await this.executeWithRetry(client, {
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: {
          maxOutputTokens: 300,
          systemInstruction: `Anda adalah AI Co-Teacher untuk platform BULAENG Classroom OS.
Saat ini kelas sedang berada pada momen: "${currentMoment}".

Gunakan panduan pedagogis berikut sebagai acuan utama Anda:
${ragContext}

Berikan respon yang singkat, praktis, mendukung pedagogi aktif, dan langsung dapat diterapkan oleh guru di kelas.`,
        },
      });

      // Ekstraksi teks respon secara aman
      const responseText =
        typeof response.text === 'function' ? response.text() :
        response.text ||
        response.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!responseText) {
        return 'Tidak ada respon teks yang dihasilkan oleh AI Brain.';
      }

      return responseText;
    } catch (error: any) {
      console.error('❌ [BRAIN ERROR DETAIL]:', error?.message || error);

      const errorStr = JSON.stringify(error);
      const isRateLimit =
        error?.status === 429 ||
        errorStr.includes('429') ||
        errorStr.includes('RESOURCE_EXHAUSTED') ||
        error?.message?.includes('429');

      // Jika kuota habis, kembalikan Fallback Mock Respon berserta RAG Context agar alur UI/Workflow TETAP BERJALAN
      if (isRateLimit) {
        console.warn('🔄 Switching to Mock Fallback due to API Quota Limit.');
        return `🤖 [BULAENG Brain - Dev Mode]\n${ragContext}\n\n(Quota Limit) Instruksi "${prompt}" berhasil diproses secara lokal!`;
      }

      return 'Maaf, terjadi kesalahan teknis pada sistem AI Brain.';
    }
  }
}