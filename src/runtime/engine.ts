import { SessionManager } from './session-manager';
import { WorkflowOrchestrator } from '@workflow/orchestrator';
import { BrainProcessor } from '@brain/processor';
import { AnalyticsTracker } from '../analytics/tracker';
import { AnalyticsCollector, SessionMetrics } from '../analytics/collector';
import { LearningTracker } from '../learning/tracker';
import { MissionEngine } from '../mission/engine'; // ➕ Import MissionEngine

export class ClassroomRuntimeEngine {
  public sessionManager: SessionManager;
  public orchestrator: WorkflowOrchestrator;
  public brain: BrainProcessor;
  public analyticsTracker: AnalyticsTracker;
  public analyticsCollector: AnalyticsCollector;
  public learningTracker: LearningTracker;
  public missionEngine: MissionEngine; // ➕ Property MissionEngine

  constructor(sessionId: string, classId: string, teacherId: string) {
    this.sessionManager = new SessionManager(sessionId, classId, teacherId);
    this.orchestrator = new WorkflowOrchestrator();
    this.brain = new BrainProcessor();
    
    // Inisialisasi Sub-System
    this.analyticsTracker = new AnalyticsTracker();
    this.analyticsCollector = new AnalyticsCollector(this.analyticsTracker);
    this.learningTracker = new LearningTracker();
    this.missionEngine = new MissionEngine(); // ➕ Inisialisasi
  }

  public boot(): void {
    this.sessionManager.start();
    this.analyticsTracker.track('SESSION_START', this.sessionManager.getSession().sessionId, {
      classId: this.sessionManager.getSession().classId,
      teacherId: this.sessionManager.getSession().teacherId,
    });
  }

  public advanceMoment(): void {
    const nextMoment = this.orchestrator.advance();
    this.analyticsTracker.track('MOMENT_CHANGE', this.sessionManager.getSession().sessionId, {
      activeMoment: nextMoment?.title || 'COMPLETED',
    });
  }

  public getMetrics(): SessionMetrics {
    return this.analyticsCollector.generateSessionSummary(this.sessionManager.getSession().sessionId);
  }

  public shutdown(): void {
    this.sessionManager.complete();
    this.analyticsTracker.track('SESSION_END', this.sessionManager.getSession().sessionId);
  }
}