import { GoogleGenAI } from '@google/genai';

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
    retries = 2,
    defaultDelayMs = 4000
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
          // Coba ekstrak retryDelay asli dari error Google jika ada (misal: "38s" -> 38000ms)
          const retryMatch = errorStr.match(/"retryDelay"\s*:\s*"(\d+)s"/);
          if (retryMatch && retryMatch[1]) {
            currentDelay = parseInt(retryMatch[1], 10) * 1000 + 1000; // Tambah buffer 1 detik
          }

          console.warn(
            `⚠️ [BRAIN] Rate limit (429) terdeteksi. Mencoba ulang dalam ${Math.round(currentDelay / 1000)} detik... (Percobaan ${attempt + 1}/${retries})`
          );

          await new Promise((resolve) => setTimeout(resolve, currentDelay));
          currentDelay *= 2; // Eksponensial jika tidak ada header dari Google
        } else {
          throw error;
        }
      }
    }
  }

  /**
   * Mengolah perintah atau pertanyaan pedagogis dari guru/siswa
   */
  public async processPedagogicalPrompt(
    prompt: string,
    currentMoment: string
  ): Promise<string> {
    try {
      const client = this.getClient();

      if (!client) {
        return `[BRAIN OFFLINE MODE]: API Key belum dikonfigurasi. Prompt diterima: "${prompt}" pada momen "${currentMoment}".`;
      }

      // Memanggil Gemini API dengan fitur Auto-Retry
      const response = await this.executeWithRetry(client, {
        model: 'gemini-2.0-flash-lite',
        contents: prompt,
        config: {
          maxOutputTokens: 250, // Hemat token & mempercepat respon
          systemInstruction: `Anda adalah AI Co-Teacher untuk platform BULAENG Classroom OS. 
Saat ini kelas sedang berada pada momen: "${currentMoment}". 
Berikan respon yang singkat, mendukung pedagogi aktif, dan relevan dengan momen tersebut.`,
        },
      });

      // PERBAIKAN: Pemanggilan method response.text()
      const responseText = typeof response.text === 'function' ? response.text() : response.text;

      if (!responseText) {
        return 'Tidak ada respon yang dihasilkan oleh AI Brain.';
      }

      return responseText;
    } catch (error: any) {
      console.error('❌ [BRAIN ERROR DETAIL]:', error?.message || error);

      const errorStr = JSON.stringify(error);
      if (
        error?.status === 429 ||
        errorStr.includes('429') ||
        errorStr.includes('RESOURCE_EXHAUSTED') ||
        error?.message?.includes('429')
      ) {
        return '⚠️ Kuota gratis Gemini sedang sibuk. Silakan coba tekan tombol Tanya AI kembali dalam beberapa saat.';
      }

      return 'Maaf, terjadi kesalahan saat memproses instruksi AI.';
    }
  }
}