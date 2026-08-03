export interface Quest {
  questId: string;
  title: string;
  xpReward: number;
  isCompleted: boolean;
}

export class MissionEngine {
  private quests: Map<string, Quest> = new Map();
  private totalXp: number = 0;

  constructor() {
    // Mission bawaan/default
    this.addQuest({
      questId: 'q-orientasi',
      title: 'Selesaikan Orientasi Masalah',
      xpReward: 100,
      isCompleted: false,
    });
  }

  public addQuest(quest: Quest): void {
    this.quests.set(quest.questId, quest);
  }

  public completeQuest(questId: string): number {
    const quest = this.quests.get(questId);
    if (quest && !quest.isCompleted) {
      quest.isCompleted = true;
      this.totalXp += quest.xpReward;
      return quest.xpReward;
    }
    return 0;
  }

  public getMissionStatus() {
    return {
      totalXp: this.totalXp,
      activeQuests: Array.from(this.quests.values()),
    };
  }
}