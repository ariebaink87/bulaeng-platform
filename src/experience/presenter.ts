import { ClassroomRuntimeEngine } from '../runtime/engine';
import { ClassroomUIState } from './state';

export class ClassroomPresenter {
  private engine: ClassroomRuntimeEngine;

  constructor(engine: ClassroomRuntimeEngine) {
    this.engine = engine;
  }

  public getUIState(): ClassroomUIState {
    const session = this.engine.sessionManager.getSession();
    
    // Ambil momen aktif via getStatus()
    const workflowStatus = this.engine.orchestrator.getStatus();
    const activeMoment = workflowStatus.activeMoment;
    const currentMomentTitle = activeMoment ? activeMoment.title : 'Belum Dimulai / Selesai';

    return {
      sessionId: session.sessionId,
      classId: session.classId,
      activeMomentTitle: currentMomentTitle,
      progressPercentage: session.status === 'COMPLETED' ? 100 : (activeMoment ? 50 : 0),
      isAiProcessing: false,
      systemStatus: session.status === 'ACTIVE' ? 'RUNNING' : 'ENDED',
    };
  }
}