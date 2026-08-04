export type SessionStatus = 'PLANNED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';

export interface TeachingSession {
  id: string;
  classroomId: string;
  teacherId: string;
  episodeId: string;      // ID dari paket episode di learning/
  status: SessionStatus;
  startedAt?: Date;
  endedAt?: Date;
}