import { EpisodePackage } from '../../contracts/episode.contract';

export class PrepareTeachingDayMission {
  async execute(targetGroup: string = 'B1'): Promise<EpisodePackage> {
    console.log(`[03:00 AM Cron] 🌙 Executing PrepareTeachingDayMission for Group: ${targetGroup}...`);

    // Mengonstruksi "Episode 03 — Petualangan Si Daun Ajaib"
    const preparedEpisode: EpisodePackage = {
      episodeId: 'EP-03-LEAF-MAGIC',
      title: 'Episode 03 — Petualangan Si Daun Ajaib',
      universe: 'Dunia Alam',
      story: 'Jelajah Alam Sekitar Kita',
      group: targetGroup,
      semester: 1,
      theme: 'Tanaman',
      preparedAt: new Date().toISOString(),
      scenes: [
        { id: 'SC-01', name: 'Opening', durationMinutes: 10, promptInstruction: 'Sapa murid dan nyanyikan lagu pembuka.' },
        { id: 'SC-02', name: 'Animation', durationMinutes: 5, promptInstruction: 'Putar video animasi Si Daun Ajaib.' },
        { id: 'SC-03', name: 'Discussion', durationMinutes: 10, promptInstruction: 'Diskusi bentuk dan warna daun.' },
        { id: 'SC-04', name: 'Activity', durationMinutes: 20, promptInstruction: 'Mewarnai & menempel cetakan daun.' },
        { id: 'SC-05', name: 'Observation', durationMinutes: 10, promptInstruction: 'Catat tingkat keaktifan anak.' },
        { id: 'SC-06', name: 'Reflection', durationMinutes: 5, promptInstruction: 'Ulasan singkat & apresiasi kelas.' }
      ]
    };

    return preparedEpisode;
  }
}