export interface Classroom {
  id: string;
  name: string;           // Contoh: "Kelas KB A / TPA Sunshine"
  academicYear: string;   // Contoh: "2025/2026"
  leadTeacherId: string;  // ID Guru Utama
  studentIds: string[];   // Daftar ID Siswa di kelas
  createdAt: Date;
  updatedAt: Date;
}