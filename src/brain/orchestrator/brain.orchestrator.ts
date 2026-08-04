import { PrepareDayWorkflow } from '../../workflow/prepare-day.workflow';
import { EpisodePackage } from '../../contracts/episode.contract';

export class BrainOrchestrator {
  private prepareDayWorkflow: PrepareDayWorkflow;
  private activePackages: Map<string, EpisodePackage> = new Map();

  constructor() {
    this.prepareDayWorkflow = new PrepareDayWorkflow();
  }

  /**
   * Pemicu Siklus Jam 03:00 Pagi
   */
  async triggerEarlyMorningProcess(group: string = 'B1'): Promise<EpisodePackage> {
    console.log(`\n🧠 [BRAIN ORCHESTRATOR] Initializing 03:00 AM Preparation for Group: ${group}...`);

    // 1. Panggil Workflow
    const episodePackage = await this.prepareDayWorkflow.runEarlyMorningPreparation(group);

    // 2. Simpan ke Memory Orchestrator
    this.activePackages.set(episodePackage.episodeId, episodePackage);

    console.log(`🧠 [BRAIN ORCHESTRATOR] Package stored in active memory. Ready for 07:00 AM Runtime Execution.`);
    return episodePackage;
  }

  /**
   * Mengambil Paket Episode yang Siap Diajarkan Jam 07:00 Pagi
   */
  getPreparedEpisode(episodeId: string): EpisodePackage | undefined {
    return this.activePackages.get(episodeId);
  }
}