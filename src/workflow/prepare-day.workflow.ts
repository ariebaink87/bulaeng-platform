import { PrepareTeachingDayMission } from '../mission/prepare-day/prepare-day.mission';
import { EpisodePackage } from '../contracts/episode.contract';

export class PrepareDayWorkflow {
  private prepareMission: PrepareTeachingDayMission;

  constructor() {
    this.prepareMission = new PrepareTeachingDayMission();
  }

  /**
   * Menjalankan siklus otomatis jam 03.00 pagi untuk menyiapkan kelas
   */
  async runEarlyMorningPreparation(targetGroup: string = 'B1'): Promise<EpisodePackage> {
    console.log('🔄 [WORKFLOW] Starting Early Morning Automated Cycle (03:00 AM)...');
    
    // 1. Eksekusi Mission
    const episodePackage = await this.prepareMission.execute(targetGroup);

    console.log(`✅ [WORKFLOW] Episode successfully prepared: ${episodePackage.title}`);
    
    // 2. Kembalikan paket episode yang siap dimasukkan ke Runtime Orchestrator
    return episodePackage;
  }
}