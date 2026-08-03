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

      // Menggunakan model Gemini 2.0 Flash bawaan SDK @google/genai
      const response = await client.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: {
          systemInstruction: `Anda adalah AI Co-Teacher untuk platform BULAENG Classroom OS. 
Saat ini kelas sedang berada pada momen: "${currentMoment}". 
Berikan respon yang singkat, mendukung pedagogi aktif, dan relevan dengan momen tersebut.`,
        },
      });

      const responseText = response.text;
      
      if (!responseText) {
        return 'Tidak ada respon yang dihasilkan oleh AI Brain.';
      }

      return responseText;
    } catch (error: any) {
      console.error('❌ [BRAIN ERROR DETAIL]:', error?.message || error);

      // Handling khusus jika terkena limit kuota request (429)
      const errorStr = JSON.stringify(error);
      if (error?.status === 429 || errorStr.includes('429') || errorStr.includes('RESOURCE_EXHAUSTED')) {
        return 'Mohon tunggu beberapa detik, AI Co-Teacher sedang mencapai batas antrean request.';
      }

      return 'Maaf, terjadi kesalahan saat memproses instruksi AI.';
    }
  }
}