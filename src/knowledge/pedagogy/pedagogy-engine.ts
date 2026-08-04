export interface MomentPedagogy {
  fokus: string;
  strategi: string[];
}

export const PEDAGOGY_RULES: Record<string, MomentPedagogy> = {
  "Pembukaan & Apersepsi": {
    fokus: "Membangun keterikatan (engagement) & menghubungkan materi dengan pengalaman nyata.",
    strategi: [
      "Gunakan teknik Think-Pair-Share singkat.",
      "Lakukan Ice Breaking energizer selama 2-3 menit.",
      "Lemparkan pertanyaan pemantik yang provokatif/kontekstual."
    ]
  },
  "Eksplorasi Konsep": {
    fokus: "Penyampaian materi inti dan fasilitasi pemahaman awal.",
    strategi: [
      "Gunakan studi kasus nyata yang relevan.",
      "Terapkan teknik penanya bergilir (Popsicle sticks).",
      "Gunakan peta konsep visual."
    ]
  },
  "Diskusi Kelompok": {
    fokus: "Kolaborasi, pemecahan masalah, dan komunikasi antar siswa.",
    strategi: [
      "Berikan peran spesifik di tiap kelompok (Ketua, Notulis, Presenter).",
      "Gunakan timer visual untuk menjaga alur.",
      "Lakukan keliling kelas (gallery walk/monitoring)."
    ]
  },
  "Refleksi & Evaluasi": {
    fokus: "Evaluasi pemahaman, umpan balik konstruktif, dan penyimpulan.",
    strategi: [
      "Gunakan format umpan balik '2 Stars and 1 Wish'.",
      "Minta siswa menuliskan 1 hal baru yang dipelajari di sticky notes.",
      "Berikan penguatan pada konsep yang paling banyak disalahpahami."
    ]
  }
};