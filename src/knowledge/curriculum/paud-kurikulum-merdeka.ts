export interface CapaianPembelajaran {
  elemen: 'JATI_DIRI' | 'NILAI_AGAMA_DAN_BUDI_PEKERTI' | 'DASAR_LITERASI_STEAM';
  deskripsi: string;
}

export const CP_PAUD_DEFAULT: CapaianPembelajaran[] = [
  {
    elemen: 'JATI_DIRI',
    deskripsi: 'Anak mengenali, mengelola, mengekspresikan emosi diri serta membangun hubungan sosial yang sehat.',
  },
  {
    elemen: 'DASAR_LITERASI_STEAM',
    deskripsi: 'Anak menunjukkan rasa ingin tahu melalui eksplorasi, penyelidikan, dan pemikiran kritis.',
  },
];