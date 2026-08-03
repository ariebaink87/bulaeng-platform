import { ClassSession, SessionStatus } from '@contracts/session';

export class SessionManager {
  private session: ClassSession;

  constructor(sessionId: string, classId: string, teacherId: string) {
    this.session = {
      sessionId,
      classId,
      teacherId,
      status: 'CREATED',
      startedAt: new Date(),
      activeParticipantsCount: 0,
    };
  }

  public getSession(): ClassSession {
    return this.session;
  }

  public start(): void {
    this.session.status = 'ACTIVE';
  }

  public pause(): void {
    this.session.status = 'PAUSED';
  }

  public resume(): void {
    this.session.status = 'ACTIVE';
  }

  public complete(): void {
    this.session.status = 'COMPLETED';
    this.session.endedAt = new Date();
  }

  public updateParticipants(count: number): void {
    this.session.activeParticipantsCount = count;
  }
}