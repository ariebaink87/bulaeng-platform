export interface AnalyticsEvent {
  eventId: string;
  sessionId: string;
  type: 'SESSION_START' | 'SESSION_END' | 'MOMENT_CHANGE' | 'AI_EXECUTION' | 'ERROR';
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export class AnalyticsTracker {
  private events: AnalyticsEvent[] = [];

  public track(type: AnalyticsEvent['type'], sessionId: string, metadata?: Record<string, unknown>): AnalyticsEvent {
    const event: AnalyticsEvent = {
      eventId: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sessionId,
      type,
      timestamp: new Date(),
      metadata,
    };

    this.events.push(event);
    console.log(`[ANALYTICS EVENT] [${event.type}]`, metadata || '');
    return event;
  }

  public getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }
}