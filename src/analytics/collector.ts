import { AnalyticsTracker } from './tracker';

export interface SessionMetrics {
  totalEventsLogged: number;
  aiCommandsExecuted: number;
  errorsCount: number;
}

export class AnalyticsCollector {
  private tracker: AnalyticsTracker;

  constructor(tracker: AnalyticsTracker) {
    this.tracker = tracker;
  }

  public generateSessionSummary(sessionId: string): SessionMetrics {
    const events = this.tracker.getEvents().filter((e) => e.sessionId === sessionId);

    return {
      totalEventsLogged: events.length,
      aiCommandsExecuted: events.filter((e) => e.type === 'AI_EXECUTION').length,
      errorsCount: events.filter((e) => e.type === 'ERROR').length,
    };
  }
}