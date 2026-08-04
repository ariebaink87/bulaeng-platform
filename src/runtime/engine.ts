import { SessionManager } from './session-manager';
import { WorkflowOrchestrator } from '../workflow/orchestrator';
import { BrainProcessor } from '../brain/processor';
import { AnalyticsTracker } from '../analytics/tracker';
import { AnalyticsCollector, SessionMetrics } from '../analytics/collector';
import { LearningTracker } from '../learning/tracker';
import { MissionEngine } from '../mission/engine';

export class ClassroomRuntimeEngine {
  public sessionManager: SessionManager;
  public orchestrator: WorkflowOrchestrator;
  public brain: BrainProcessor;
  public analyticsTracker: AnalyticsTracker;
  public analyticsCollector: AnalyticsCollector;
  public learningTracker: LearningTracker;
  public missionEngine: MissionEngine;

  constructor(sessionId: string, classId: string, teacherId: string) {
    this.sessionManager = new SessionManager(sessionId, classId, teacherId);
    this.orchestrator = new WorkflowOrchestrator();
    this.brain = new BrainProcessor();

    // Inisialisasi Sub-System
    this.analyticsTracker = new AnalyticsTracker();
    this.analyticsCollector = new AnalyticsCollector(this.analyticsTracker);
    this.learningTracker = new LearningTracker();
    this.missionEngine = new MissionEngine();
  }

  /**
   * Helper internal untuk mengambil sesi aktif tanpa pemanggilan berulang
   */
  private get activeSession() {
    return this.sessionManager.getSession();
  }

  /**
   * Memulai Sesi Kelas (07:00 AM Execution)
   */
  public boot(): void {
    this.sessionManager.start();

    const session = this.activeSession;
    this.analyticsTracker.track('SESSION_START', session.sessionId, {
      classId: session.classId,
      teacherId: session.teacherId,
    });

    console.log(`🚀 [RUNTIME ENGINE] Session ${session.sessionId} started for Class ${session.classId}`);
  }

  /**
   * Berpindah ke moment / scene berikutnya dalam pembelajaran
   */
  public advanceMoment(): void {
    const nextMoment = this.orchestrator.advance();
    const session = this.activeSession;

    this.analyticsTracker.track('MOMENT_CHANGE', session.sessionId, {
      activeMoment: nextMoment?.title || 'COMPLETED',
    });

    if (nextMoment) {
      console.log(`▶️ [RUNTIME ENGINE] Advanced to moment: ${nextMoment.title}`);
    } else {
      console.log(`🏁 [RUNTIME ENGINE] All moments completed for session ${session.sessionId}`);
    }
  }

  /**
   * Mengambil rangkuman metrik analytics dari sesi berjalan
   */
  public getMetrics(): SessionMetrics {
    return this.analyticsCollector.generateSessionSummary(this.activeSession.sessionId);
  }

  /**
   * Mengakhiri Sesi Kelas
   */
  public shutdown(): void {
    const session = this.activeSession;
    this.sessionManager.complete();
    this.analyticsTracker.track('SESSION_END', session.sessionId);

    console.log(`🛑 [RUNTIME ENGINE] Session ${session.sessionId} successfully shut down.`);
  }
}