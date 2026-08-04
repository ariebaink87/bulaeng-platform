import { BRIEFING_SYSTEM_PROMPT, CP_PAUD_DEFAULT } from '../knowledge';
import { Classroom, Teacher } from '../domain';

export interface BriefingRequest {
  teacher: Teacher;
  classroom: Classroom;
  date: string;
}

export interface BriefingResponse {
  summary: string;
  focusElements: string[];
  recommendedActivities: string[];
}

export class BriefingEngine {
  /**
   * Menghasilkan Briefing Card harian untuk guru berbasis konteks kelas & kurikulum
   */
  public async generateDailyBriefing(req: BriefingRequest): Promise<BriefingResponse> {
    // Di sini nantinya LLM SDK (Gemini/OpenAI) dipanggil menggunakan BRIEFING_SYSTEM_PROMPT
    const prompt = `${BRIEFING_SYSTEM_PROMPT}\n\nKelas: ${req.classroom.name}\nGuru: ${req.teacher.name}`;
    
    // Simulasi hasil olahan AI Engine berdasarkan acuan Kurikulum Merdeka
    return {
      summary: `Selamat pagi ${req.teacher.name}! Hari ini fokus pengajaran kelas ${req.classroom.name} adalah eksplorasi emosi & literasi dasar.`,
      focusElements: CP_PAUD_DEFAULT.map((cp) => cp.elemen),
      recommendedActivities: [
        'Lingkaran Pagi: Berbagi perasaan menggunakan kartu emosi',
        'Eksplorasi STEAM: Membangun menara dari blok kayu secara berpasangan',
      ],
    };
  }
}