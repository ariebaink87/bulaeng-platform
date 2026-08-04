import { PEDAGOGY_RULES } from './pedagogy/pedagogy-engine';

// Export semua file knowledge yang sudah ada sebelumnya
export * from './prompt-library/briefing.prompt';
export * from './curriculum/paud-kurikulum-merdeka';
export * from './pedagogy/pedagogy-engine';

// Helper Engine untuk RAG / Context Retrieval
export class KnowledgeEngine {
  /**
   * Mengambil referensi konteks pedagogis berdasarkan momen kelas aktif
   */
  static getContextByMoment(momentName: string): string {
    const rule = PEDAGOGY_RULES[momentName];
    if (!rule) {
      return "Fokus pada keterlibatan aktif, komunikasi positif, dan kondusifitas kelas.";
    }

    return `
[KONTEKS PEDAGOGIS MOMEN: ${momentName}]
- Fokus Utama: ${rule.fokus}
- Rekomendasi Taktis:
  * ${rule.strategi.join('\n  * ')}
    `.trim();
  }
}