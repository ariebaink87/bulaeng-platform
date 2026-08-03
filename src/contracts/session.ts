export type SessionStatus = 'CREATED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'TERMINATED';

export interface ClassSession {
  sessionId: string;
  classId: string;
  teacherId: string;
  status: SessionStatus;
  currentMomentId?: string;
  startedAt: Date;
  endedAt?: Date;
  activeParticipantsCount: number;
}