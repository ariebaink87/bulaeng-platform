export interface AssessmentRecord {
  studentId: string;
  competencyId: string;
  score: number; // 0 - 100
  feedback?: string;
}

export class LearningTracker {
  private records: AssessmentRecord[] = [];

  /**
   * Catat nilai kompetensi siswa
   */
  public recordAssessment(assessment: AssessmentRecord): void {
    this.records.push(assessment);
  }

  /**
   * Hitung rata-rata nilai kelas untuk kompetensi tertentu
   */
  public getAverageScore(competencyId: string): number {
    const filtered = this.records.filter((r) => r.competencyId === competencyId);
    if (filtered.length === 0) return 0;

    const total = filtered.reduce((acc, curr) => acc + curr.score, 0);
    return Math.round(total / filtered.length);
  }

  /**
   * Ambil ringkasan seluruh catatan penilaian
   */
  public getSummary() {
    return {
      totalAssessments: this.records.length,
      records: this.records,
    };
  }
}