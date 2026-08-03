import { ClassroomMoment } from '@contracts/moment';
import { WorkflowStateManager, WorkflowState } from './state';

export class WorkflowOrchestrator {
  private stateManager: WorkflowStateManager;

  constructor(moments: ClassroomMoment[] = []) {
    this.stateManager = new WorkflowStateManager(moments);
  }

  public loadPlan(moments: ClassroomMoment[]): void {
    this.stateManager.setMoments(moments);
  }

  public getStatus(): WorkflowState {
    return this.stateManager.getCurrentState();
  }

  public advance(): ClassroomMoment | null {
    return this.stateManager.next();
  }
}