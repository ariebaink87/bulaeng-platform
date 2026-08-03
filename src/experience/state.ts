export interface ClassroomUIState {
  sessionId: string;
  classId: string;
  activeMomentTitle: string;
  progressPercentage: number;
  isAiProcessing: boolean;
  systemStatus: 'READY' | 'RUNNING' | 'PAUSED' | 'ENDED';
}